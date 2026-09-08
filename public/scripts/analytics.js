(function () {
  var GA_ID = 'G-5KG25EY8YL';

  window.loadAnalytics = function loadAnalytics() {
    if (window.__analyticsLoaded) return;
    window.__analyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    var script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    script.async = true;
    script.onload = function () {
      window.gtag('js', new Date());
      // config sends the initial page_view; SPA navigations are sent from
      // astro:after-swap, which does not fire on the initial load.
      window.gtag('config', GA_ID);
    };
    document.head.appendChild(script);
  };

  window.revokeAnalytics = function revokeAnalytics() {
    document.cookie = '_ga=; Max-Age=0; path=/; domain=.jamestannahill.com';
    document.cookie = '_gid=; Max-Age=0; path=/; domain=.jamestannahill.com';
    document.cookie = '_gat=; Max-Age=0; path=/; domain=.jamestannahill.com';
  };

  document.addEventListener('astro:after-swap', function () {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_title: document.title,
    });
  });
})();
