// Masque dans la console les erreurs causées par des extensions du navigateur (pas par le site).
// Fichier séparé (et non script en ligne) pour respecter la politique de sécurité (CSP).
(function() {
  function isSuppressed(msg, src) {
    var str = String(msg || '');
    var source = String(src || '');
    return (
      str.indexOf('s is not a function') !== -1 ||
      str.indexOf('unsafe-eval') !== -1 ||
      str.indexOf('chrome-extension://') !== -1 ||
      source.indexOf('chrome-extension://') !== -1 ||
      source.indexOf('content.js') !== -1
    );
  }
  window.addEventListener('error', function(e) {
    if (isSuppressed(e.message, e.filename)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }
  }, true);
  window.addEventListener('unhandledrejection', function(e) {
    var reason = e.reason ? (e.reason.message || String(e.reason)) : '';
    if (isSuppressed(reason, '')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
  var origError = console.error;
  console.error = function() {
    var combined = Array.prototype.slice.call(arguments).map(function(a) { return String(a || ''); }).join(' ');
    if (isSuppressed(combined, '')) return;
    origError.apply(console, arguments);
  };
})();
