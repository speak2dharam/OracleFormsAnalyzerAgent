/**
 * Lucide icon initializer
 * Runs after lucide.min.js is loaded
 */
(function () {
  'use strict';

  function initLucide() {
    if (typeof lucide === 'undefined') return;
    lucide.createIcons({ strokeWidth: 1.75 });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLucide);
  } else {
    initLucide();
  }
})();
