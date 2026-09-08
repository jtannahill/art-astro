// CloudFront Function (viewer-response) for art.jamestannahill.com.
//
// The site is served from S3 via CloudFront, so /cdn-cgi/trace does not
// exist and the consent script cannot tell where a visitor is. Without a
// country it must assume consent is required, which shows the banner to
// everyone. This copies CloudFront's own geo header into a readable cookie
// so consent.js can apply the same EU/UK/CH rule the main site uses.
//
// Viewer-response runs on cache hits too and does not touch the cache key,
// so the cookie is always the current viewer's.
function handler(event) {
  var response = event.response;
  var headers = event.request.headers;

  var country =
    headers['cloudfront-viewer-country'] &&
    headers['cloudfront-viewer-country'].value;

  // Two-letter ISO code only; anything else is dropped rather than echoed
  // back into a Set-Cookie header.
  if (!country || !/^[A-Za-z]{2}$/.test(country)) {
    return response;
  }

  response.cookies = response.cookies || {};
  response.cookies['jt_country'] = {
    value: country.toUpperCase(),
    attributes: 'Path=/; Max-Age=86400; SameSite=Lax; Secure',
  };

  return response;
}
