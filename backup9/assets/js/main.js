/**
 * Oracle Migration Workbench — Shared JavaScript
 * Bootstrap 5 + jQuery
 */

$(function () {

  /* ================================================================
     SIDEBAR TOGGLE
     ================================================================ */
  var SIDEBAR_KEY = 'omw_sidebar_collapsed';

  function applySidebarState(collapsed, animate) {
    if (collapsed) {
      $('#sidebar').addClass('collapsed');
      $('body').addClass('sidebar-collapsed');
    } else {
      $('#sidebar').removeClass('collapsed');
      $('body').removeClass('sidebar-collapsed');
    }
  }

  // Restore saved state
  var saved = localStorage.getItem(SIDEBAR_KEY);
  applySidebarState(saved === 'true');

  // Toggle buttons (topbar hamburger + sidebar bottom button)
  $('#sidebarToggle, #sidebarToggle2').on('click', function () {
    var isCollapsed = $('#sidebar').hasClass('collapsed');
    applySidebarState(!isCollapsed);
    localStorage.setItem(SIDEBAR_KEY, String(!isCollapsed));
  });

  /* ----------------------------------------------------------------
     Mobile overlay
  ---------------------------------------------------------------- */
  if ($('.sidebar-overlay').length === 0) {
    $('body').append('<div class="sidebar-overlay" id="sidebarOverlay"></div>');
  }

  $('#sidebarToggle').on('click', function () {
    if ($(window).width() < 992) {
      $('#sidebar').toggleClass('mobile-open');
      $('#sidebarOverlay').toggleClass('active');
    }
  });

  $('#sidebarOverlay').on('click', function () {
    $('#sidebar').removeClass('mobile-open');
    $(this).removeClass('active');
  });

  /* ================================================================
     ACTIVE NAV LINK
     ================================================================ */
  var currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
  if (currentFile === '' || currentFile === 'index.html') currentFile = 'dashboard.html';

  $('.sidebar-link').each(function () {
    var href = $(this).attr('href') || '';
    if (href && href.split('/').pop() === currentFile) {
      $(this).addClass('active');
    }
  });

  /* ================================================================
     SIDEBAR SUBMENU TOGGLE
     ================================================================ */
  // Auto-open submenu if a child is the active page
  $('.sidebar-submenu').each(function () {
    var $sub = $(this);
    if ($sub.find('.sidebar-link.active').length) {
      $sub.addClass('open');
      $('[data-submenu="' + $sub.attr('id') + '"]').addClass('submenu-open');
    }
  });

  // Toggle on click of parent item (expanded sidebar)
  $(document).on('click', '.has-submenu', function (e) {
    e.preventDefault();
    if ($('#sidebar').hasClass('collapsed')) return; // handled by flyout
    var subId = $(this).data('submenu');
    var $sub  = $('#' + subId);
    var isOpen = $sub.hasClass('open');
    // Close all other submenus
    $('.sidebar-submenu.open').not($sub).removeClass('open');
    $('.has-submenu.submenu-open').not(this).removeClass('submenu-open');
    // Toggle this one
    $sub.toggleClass('open', !isOpen);
    $(this).toggleClass('submenu-open', !isOpen);
  });

  /* ================================================================
     COLLAPSED SIDEBAR FLYOUT (submenu hover panel)
     ================================================================ */
  var currentFile2 = window.location.pathname.split('/').pop() || 'dashboard.html';
  var $flyout = $('<div class="sidebar-flyout" id="sidebarFlyout"></div>').appendTo('body');
  var flyoutTimer = null;

  function showFlyout($link) {
    if (!$('#sidebar').hasClass('collapsed')) return;
    // Skip sublinks (they're hidden in collapsed mode anyway)
    if ($link.hasClass('sidebar-sublink')) return;

    var subId    = $link.data('submenu');
    var label    = $link.find('.link-text').text().trim() || $link.data('label') || '';
    var href     = $link.attr('href') || '#';
    var offset   = $link.offset();
    var sidebarW = $('#sidebar').outerWidth() + 8;
    var html     = '';

    if (subId) {
      // Has submenu — show label header + sub-items
      html = '<div class="flyout-label">' + label + '</div>';
      $('#' + subId).find('.sidebar-sublink').each(function () {
        var itemHref  = $(this).attr('href');
        var text      = $(this).find('.link-text').text().trim();
        var iconName  = $(this).find('.link-icon i[data-lucide]').attr('data-lucide') || 'circle';
        var active    = itemHref.split('/').pop() === currentFile2 ? ' active' : '';
        html += '<a href="' + itemHref + '" class="flyout-item' + active + '"><i data-lucide="' + iconName + '"></i>' + text + '</a>';
      });
    } else {
      // Regular link — show as a simple tooltip pill
      html = '<a href="' + href + '" class="flyout-tooltip-label">' + label + '</a>';
    }

    $flyout.html(html).css({ top: offset.top, left: sidebarW }).addClass('visible');
    if (typeof lucide !== 'undefined') lucide.createIcons({ strokeWidth: 1.75 });
  }

  function hideFlyout() {
    $flyout.removeClass('visible');
  }

  // Trigger flyout for ALL sidebar links (submenu + regular) in collapsed mode
  $('#sidebar').on('mouseenter', '.sidebar-link:not(.sidebar-sublink)', function () {
    clearTimeout(flyoutTimer);
    showFlyout($(this));
  }).on('mouseleave', '.sidebar-link:not(.sidebar-sublink)', function () {
    flyoutTimer = setTimeout(function () {
      if (!$flyout.is(':hover')) hideFlyout();
    }, 120);
  });

  $flyout.on('mouseenter', function () {
    clearTimeout(flyoutTimer);
  }).on('mouseleave', function () {
    hideFlyout();
  });

  // Hide flyout when sidebar expands
  $('#sidebarToggle, #sidebarToggle2').on('click', function () {
    hideFlyout();
  });

  /* ================================================================
     COUNTER ANIMATION
     ================================================================ */
  function animateCounters() {
    $('.counter-animate').each(function () {
      var $el = $(this);
      var target   = parseFloat($el.data('target') || $el.text().replace(/[^0-9.]/g, ''));
      var prefix   = $el.data('prefix') || '';
      var suffix   = $el.data('suffix') || '';
      var decimals = parseInt($el.data('decimals') || 0, 10);
      var duration = parseInt($el.data('duration') || 1200, 10);

      $({ val: 0 }).animate({ val: target }, {
        duration: duration,
        easing: 'swing',
        step: function () {
          $el.text(prefix + this.val.toFixed(decimals) + suffix);
        },
        complete: function () {
          $el.text(prefix + target.toFixed(decimals) + suffix);
        }
      });
    });
  }

  // Use IntersectionObserver if available, else fire immediately
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCounters();
          obs.disconnect();
        }
      });
    }, { threshold: 0.1 });
    if ($('.counter-animate').length) obs.observe($('.counter-animate')[0]);
  } else {
    setTimeout(animateCounters, 300);
  }

  /* ================================================================
     PROGRESS BAR ANIMATION
     ================================================================ */
  function animateProgressBars() {
    $('.progress-bar').each(function () {
      var $bar = $(this);
      var target = $bar.data('width') || $bar.attr('aria-valuenow') || 0;
      $bar.css('width', 0).animate({ width: target + '%' }, 900);
    });
  }
  setTimeout(animateProgressBars, 250);

  /* ================================================================
     BOOTSTRAP TOOLTIPS
     ================================================================ */
  var tooltipElems = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipElems.forEach(function (el) {
    new bootstrap.Tooltip(el, { trigger: 'hover' });
  });

  /* ================================================================
     PAGE LOADER HIDE
     ================================================================ */
  function hideLoader() {
    var $loader = $('#page-loader');
    if (!$loader.length || $loader.hasClass('hidden')) return;
    $loader.addClass('hidden');
    setTimeout(function () { $loader.remove(); }, 220);
  }

  // Hide as soon as DOM + inline scripts are ready (fastest path)
  hideLoader();

  // Also cover any late-loading scenarios
  $(window).on('load', hideLoader);

  // Hard fallback — never show more than 350 ms
  setTimeout(hideLoader, 350);

  /* ================================================================
     UPLOAD ZONE DRAG & DROP
     ================================================================ */
  var $zone = $('.upload-zone');
  if ($zone.length) {
    $zone.on('dragover dragenter', function (e) {
      e.preventDefault();
      $(this).addClass('dragover');
    }).on('dragleave drop', function (e) {
      e.preventDefault();
      $(this).removeClass('dragover');
    }).on('click', function () {
      $('#fileInput').trigger('click');
    });

    $('#fileInput').on('change', function () {
      var files = this.files;
      if (files.length) showFileToast(files.length + ' file(s) selected');
    });
  }

  function showFileToast(msg) {
    var id = 'toast_' + Date.now();
    var html = '<div id="' + id + '" class="toast align-items-center text-bg-primary border-0 position-fixed bottom-0 end-0 m-3" role="alert" aria-live="assertive" style="z-index:9999">' +
      '<div class="d-flex"><div class="toast-body">' + msg + '</div>' +
      '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>';
    $('body').append(html);
    var toast = new bootstrap.Toast(document.getElementById(id), { delay: 3000 });
    toast.show();
    $('#' + id).on('hidden.bs.toast', function () { $(this).remove(); });
  }

  /* ================================================================
     COPY CODE BUTTON
     ================================================================ */
  $(document).on('click', '.copy-btn', function () {
    var code = $(this).closest('.code-block').find('code').text() ||
               $(this).closest('.code-block').clone().children('.copy-btn').remove().end().text().trim();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(function () {});
    }
    var $btn = $(this);
    $btn.html('<i class="fas fa-check me-1"></i>Copied!');
    setTimeout(function () { $btn.html('<i class="fas fa-copy me-1"></i>Copy'); }, 2000);
  });

  /* ================================================================
     DEPLOYMENT PAGE — LIVE METRICS SIMULATION
     ================================================================ */
  if ($('#deployLiveMetrics').length) {
    function updateMetrics() {
      $('#metricCpu').text(  (Math.random() * 30 + 35).toFixed(1) + '%');
      $('#metricMem').text(  (Math.random() * 20 + 50).toFixed(1) + '%');
      $('#metricRps').text(  Math.floor(Math.random() * 400 + 800));
      $('#metricLatency').text((Math.random() * 40 + 60).toFixed(0) + 'ms');
    }
    updateMetrics();
    setInterval(updateMetrics, 3000);
  }

  /* ================================================================
     DEPLOYMENT PAGE — STEP PROGRESSION SIMULATION
     ================================================================ */
  if ($('.deploy-step').length && $('#deployProgressBar').length) {
    var totalSteps = $('.deploy-step').length;
    var doneSteps  = $('.deploy-step-icon.done').length;
    var pct = Math.round((doneSteps / totalSteps) * 100);
    $('#deployProgressBar').css('width', pct + '%').attr('aria-valuenow', pct);
    $('#deployProgressText').text(pct + '%');
  }

  /* ================================================================
     SEARCH FILTER (Tables)
     ================================================================ */
  $(document).on('keyup', '.table-search', function () {
    var val = $(this).val().toLowerCase();
    var $table = $($(this).data('target'));
    $table.find('tbody tr').each(function () {
      var text = $(this).text().toLowerCase();
      $(this).toggle(text.indexOf(val) > -1);
    });
  });

  /* ================================================================
     PAGE-SPECIFIC CHART INITIALIZATION
     ================================================================ */
  if (typeof initPageCharts === 'function') {
    initPageCharts();
  }

  /* ================================================================
     FADE IN CARDS ON SCROLL
     ================================================================ */
  function checkFadeIn() {
    var wBottom = $(window).scrollTop() + $(window).height();
    $('.fade-in-up:not(.visible)').each(function () {
      if ($(this).offset().top < wBottom - 40) {
        $(this).addClass('visible');
      }
    });
  }
  $(window).on('scroll', checkFadeIn);
  checkFadeIn();

});
