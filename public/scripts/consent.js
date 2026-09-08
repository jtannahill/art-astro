(function () {
  var STORAGE_KEY = 'jt_analytics_consent';

  var EU = new Set([
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
    'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
    'GB', 'UK', 'CH',
  ]);

  function persist(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      /* private browsing */
    }
  }

  function read() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function requiresConsent(country) {
    if (!country) return true;
    return EU.has(country.toUpperCase());
  }

  function detectCountry() {
    return fetch('/cdn-cgi/trace', { credentials: 'same-origin' })
      .then(function (res) { return res.text(); })
      .then(function (body) {
        var match = body.match(/loc=([A-Z]{2})/);
        return match ? match[1] : null;
      })
      .catch(function () { return null; });
  }

  // Re-run on every ClientRouter navigation: the swap replaces the banner
  // element, so listeners must be bound to the new node.
  function initConsent() {
    var banner = document.getElementById('consent-banner');
    if (!banner) return;

    function hideBanner() {
      banner.hidden = true;
      banner.setAttribute('aria-hidden', 'true');
    }

    function showBanner() {
      banner.hidden = false;
      banner.setAttribute('aria-hidden', 'false');
    }

    function accept() {
      persist('accepted');
      hideBanner();
      if (typeof window.loadAnalytics === 'function') window.loadAnalytics();
    }

    function reject() {
      persist('rejected');
      hideBanner();
      if (typeof window.revokeAnalytics === 'function') window.revokeAnalytics();
    }

    document.getElementById('consent-accept')?.addEventListener('click', accept);
    document.getElementById('consent-reject')?.addEventListener('click', reject);

    var stored = read();
    if (stored === 'accepted') {
      hideBanner();
      if (typeof window.loadAnalytics === 'function') window.loadAnalytics();
      return;
    }
    if (stored === 'rejected') {
      hideBanner();
      return;
    }

    detectCountry().then(function (country) {
      if (requiresConsent(country)) showBanner();
      else {
        hideBanner();
        if (typeof window.loadAnalytics === 'function') window.loadAnalytics();
      }
    });
  }

  // ClientRouter fires astro:page-load on the initial load too, so binding
  // here only. Calling initConsent() directly as well would double-bind.
  document.addEventListener('astro:page-load', initConsent);
})();
