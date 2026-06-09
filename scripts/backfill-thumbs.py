"""Self-healing thumbnail backfill, run in CI before the s3 sync.

The art-image-resize Lambda generates preview-{480,960,1920}.webp on
every new preview-2048.png PUT, but does not yet emit the 1200px
og:image variant (preview-1200.webp). Until that Lambda is redeployed
with 1200 in its WIDTHS list, this script keeps the live site healthy:
it scans site/weather/ (the CloudFront origin prefix, mirrored from
weather/ by art-site-rebuild before this workflow's 07:17 UTC run),
finds pieces missing WebP variants, and generates just those from the
mirrored 2048 PNG.

NOTE: writes only under site/ — the art-astro-ci IAM user
(inline policy art-astro-deploy) is scoped to s3:prefix site/*.
The pipeline-side weather/ prefix is the Lambda's responsibility.

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
PREFIX = "site/weather/"
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


def fill(base: str, widths: list[int]) -> str:
    """base is e.g. site/weather/{run_id}/{slug} — read its 2048 PNG,
    write the missing WebP widths alongside it."""
    body = s3.get_object(Bucket=BUCKET, Key=f"{base}/preview-2048.png")["Body"].read()
    img = Image.open(io.BytesIO(body)).convert("RGB")
    for w in widths:
        scaled = img
        if img.width > w:
            ratio = w / img.width
            scaled = img.resize((w, int(img.height * ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        scaled.save(buf, format="WEBP", quality=QUALITY, method=4)
        s3.put_object(
            Bucket=BUCKET,
            Key=f"{base}/preview-{w}.webp",
            Body=buf.getvalue(),
            ContentType="image/webp",
            CacheControl="public, max-age=31536000, immutable",
        )
    return base


def main() -> int:
    have = list_keys(PREFIX)

    todo: dict[str, list[int]] = {}
    for key in have:
        if not key.endswith("/preview-2048.png"):
            continue
        base = key.rsplit("/", 1)[0]
        missing = [w for w in WIDTHS if f"{base}/preview-{w}.webp" not in have]
        if missing:
            todo[base] = missing

    print(f"{len(todo)} pieces missing webp variants")
    errors = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(fill, b, ws): b for b, ws in todo.items()}
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
