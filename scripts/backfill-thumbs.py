"""Self-healing thumbnail backfill, run in CI before the s3 sync.

The art-image-resize Lambda generates preview-{480,960,1920}.webp on
every new preview-2048.png PUT, but does not yet emit the 1200px
og:image variant (preview-1200.webp). Until that Lambda is redeployed
with 1200 in its WIDTHS list, this script keeps the site healthy: it
lists every weather/ piece, finds missing WebP variants, and generates
just those from the source 2048 PNG.

Writes each variant to BOTH prefixes:
  - weather/{run_id}/{slug}/preview-{w}.webp   (pipeline source of truth)
  - site/weather/...                           (CloudFront origin prefix)

Idempotent and cheap: on a normal day only the ~10 new pieces are
missing preview-1200.webp, so this finishes in seconds.

CI usage (AWS creds come from the workflow env):
  uv run --no-project --with pillow --with boto3 python scripts/backfill-thumbs.py
"""
import io
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

import boto3
from PIL import Image

BUCKET = "art-generator-216890068001"
WIDTHS = [480, 960, 1200, 1920]
QUALITY = 82

s3 = boto3.session.Session(region_name="us-east-1").client("s3")


def list_keys(prefix: str) -> set[str]:
    keys: set[str] = set()
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=BUCKET, Prefix=prefix):
        for obj in page.get("Contents", []) or []:
            keys.add(obj["Key"])
    return keys


def fill(base: str, widths: list[int], have: set[str]) -> str:
    src_key = f"{base}/preview-2048.png"
    body = s3.get_object(Bucket=BUCKET, Key=src_key)["Body"].read()
    img = Image.open(io.BytesIO(body)).convert("RGB")
    for w in widths:
        scaled = img
        if img.width > w:
            ratio = w / img.width
            scaled = img.resize((w, int(img.height * ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        scaled.save(buf, format="WEBP", quality=QUALITY, method=4)
        for key in (f"{base}/preview-{w}.webp", f"site/{base}/preview-{w}.webp"):
            if key in have:
                continue
            s3.put_object(
                Bucket=BUCKET,
                Key=key,
                Body=buf.getvalue(),
                ContentType="image/webp",
                CacheControl="public, max-age=31536000, immutable",
            )
    return base


def main() -> int:
    weather = list_keys("weather/")
    site = list_keys("site/weather/")
    have = weather | site

    todo: dict[str, list[int]] = {}
    for key in weather:
        if not key.endswith("/preview-2048.png"):
            continue
        base = key.rsplit("/", 1)[0]
        missing = [
            w
            for w in WIDTHS
            if f"{base}/preview-{w}.webp" not in have
            or f"site/{base}/preview-{w}.webp" not in have
        ]
        if missing:
            todo[base] = missing

    print(f"{len(todo)} pieces missing webp variants")
    errors = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(fill, b, ws, have): b for b, ws in todo.items()}
        for f in as_completed(futs):
            try:
                print(f"filled {f.result()} ({todo[futs[f]]})")
            except Exception as e:  # noqa: BLE001 — log and keep going
                errors += 1
                print(f"ERROR {futs[f]}: {e}")
    print(f"done: {len(todo) - errors} filled, {errors} errors")
    # Never fail the deploy over thumbnails — the <img> PNG fallback
    # keeps any straggler piece rendering.
    return 0


if __name__ == "__main__":
    sys.exit(main())
