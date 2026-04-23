/**
 * UnifyCloud UI — Cmd+K palette, dark mode, toasts, sortable tables
 * No dependencies beyond vanilla JS (runs after jQuery / Bootstrap are loaded)
 */
(function () {
  'use strict';

  /* ================================================================
     DARK MODE TOGGLE
     ================================================================ */
  var THEME_KEY = 'uc_theme';

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    // Swap icon in every theme-toggle button
    // Lucide replaces <i data-lucide> with <svg>, so we rebuild the <i> then re-render
    document.querySelectorAll('[data-uc-theme-toggle]').forEach(function (btn) {
      var existing = btn.querySelector('svg') || btn.querySelector('[data-lucide]');
      if (!existing) return;
      var newIcon = document.createElement('i');
      newIcon.setAttribute('data-lucide', dark ? 'sun' : 'moon');
      btn.replaceChild(newIcon, existing);
      if (typeof lucide !== 'undefined') lucide.createIcons({ strokeWidth: 1.75 });
    });
  }

  // Restore on load
  var saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-uc-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        applyTheme(!isDark);
      });
    });
  });

  /* ================================================================
     TOAST NOTIFICATIONS
     uc.toast('Message', 'success' | 'danger' | 'warning' | 'info')
     ================================================================ */
  window.uc = window.uc || {};

  uc.toast = function (message, type, duration) {
    type     = type     || 'info';
    duration = duration || 4000;

    var region = document.getElementById('uc-toast-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'uc-toast-region';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'false');
      document.body.appendChild(region);
    }

    var icons = { success: 'check-circle', danger: 'x-circle', warning: 'alert-triangle', info: 'info' };
    var icon  = icons[type] || 'info';

    var toast = document.createElement('div');
    toast.className = 'uc-toast uc-toast--' + type;
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<i data-lucide="' + icon + '" class="uc-toast__icon"></i>' +
      '<span class="uc-toast__msg">' + message + '</span>' +
      '<button class="uc-toast__close" aria-label="Dismiss">' +
        '<i data-lucide="x"></i>' +
      '</button>';

    region.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons({ strokeWidth: 1.75 });

    // Animate in
    requestAnimationFrame(function () { toast.classList.add('visible'); });

    function dismiss() {
      toast.classList.remove('visible');
      toast.addEventListener('transitionend', function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, { once: true });
    }

    toast.querySelector('.uc-toast__close').addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  };

  /* ================================================================
     CMD+K COMMAND PALETTE
     ================================================================ */
  var COMMANDS = [];  // populated below from current page nav

  function buildCommandList() {
    COMMANDS = [];
    document.querySelectorAll('.sidebar-link').forEach(function (el) {
      var text = (el.querySelector('.link-text') || el).textContent.trim();
      var href = el.getAttribute('href') || '#';
      if (text && href !== '#') COMMANDS.push({ label: text, href: href, icon: 'file' });
    });
    // Static utility commands
    COMMANDS.push({ label: 'Toggle Dark Mode', action: function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(!isDark);
    }, icon: 'moon' });
    COMMANDS.push({ label: 'Go to Dashboard', href: 'dashboard.html', icon: 'layout-dashboard' });
  }

  function openPalette() {
    buildCommandList();
    var overlay = document.getElementById('uc-palette-overlay');
    var input   = document.getElementById('uc-palette-input');
    if (!overlay) return;
    overlay.classList.add('open');
    input.value = '';
    renderPaletteResults('');
    setTimeout(function () { input.focus(); }, 50);
  }

  function closePalette() {
    var overlay = document.getElementById('uc-palette-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function renderPaletteResults(query) {
    var list = document.getElementById('uc-palette-list');
    if (!list) return;
    var q = query.toLowerCase();
    var matches = q
      ? COMMANDS.filter(function (c) { return c.label.toLowerCase().includes(q); })
      : COMMANDS.slice(0, 8);

    if (!matches.length) {
      list.innerHTML = '<div class="palette-empty">No results for "' + query + '"</div>';
      return;
    }

    list.innerHTML = matches.map(function (c, i) {
      return '<button class="palette-item" data-idx="' + i + '" tabindex="-1">' +
        '<i data-lucide="' + c.icon + '" class="palette-item__icon"></i>' +
        '<span>' + c.label + '</span>' +
        '</button>';
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ strokeWidth: 1.75 });

    list.querySelectorAll('.palette-item').forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        var cmd = matches[i];
        closePalette();
        if (cmd.action) { cmd.action(); }
        else if (cmd.href) { window.location.href = cmd.href; }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Inject palette markup if not already in HTML
    if (!document.getElementById('uc-palette-overlay')) {
      var tpl = document.createElement('div');
      tpl.innerHTML =
        '<div id="uc-palette-overlay" class="uc-palette-overlay" role="dialog" aria-modal="true" aria-label="Command palette">' +
          '<div class="uc-palette">' +
            '<div class="palette-search-row">' +
              '<i data-lucide="search" class="palette-search-icon"></i>' +
              '<input id="uc-palette-input" class="palette-input" placeholder="Search pages & actions…" autocomplete="off" spellcheck="false">' +
              '<kbd class="palette-esc-hint">ESC</kbd>' +
            '</div>' +
            '<div id="uc-palette-list" class="palette-list" role="listbox"></div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(tpl.firstChild);
      if (typeof lucide !== 'undefined') lucide.createIcons({ strokeWidth: 1.75 });
    }

    var overlay = document.getElementById('uc-palette-overlay');
    var input   = document.getElementById('uc-palette-input');

    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closePalette();
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        renderPaletteResults(input.value);
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closePalette(); return; }
        if (e.key === 'ArrowDown') {
          var first = document.querySelector('#uc-palette-list .palette-item');
          if (first) first.focus();
        }
      });
    }

    // Keyboard navigation within list
    document.addEventListener('keydown', function (e) {
      var listEl = document.getElementById('uc-palette-list');
      if (!listEl) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        var items = Array.from(listEl.querySelectorAll('.palette-item'));
        if (!items.length) return;
        var cur = document.activeElement;
        var idx = items.indexOf(cur);
        if (e.key === 'ArrowDown') idx = (idx + 1) % items.length;
        else idx = (idx - 1 + items.length) % items.length;
        items[idx].focus();
        e.preventDefault();
      }
    });

    // Open palette buttons
    document.querySelectorAll('[data-uc-palette]').forEach(function (btn) {
      btn.addEventListener('click', openPalette);
    });
  });

  // Global keyboard shortcut
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      var overlay = document.getElementById('uc-palette-overlay');
      if (overlay && overlay.classList.contains('open')) { closePalette(); }
      else { openPalette(); }
    }
    if (e.key === 'Escape') { closePalette(); }
  });

  /* ================================================================
     SORTABLE TABLES  (.data-table with [data-sort] headers)
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.data-table').forEach(function (table) {
      var headers = table.querySelectorAll('th[data-sort]');
      headers.forEach(function (th) {
        th.style.cursor = 'pointer';
        th.setAttribute('tabindex', '0');
        th.setAttribute('role', 'columnheader');

        function doSort() {
          var col     = Array.from(th.parentNode.children).indexOf(th);
          var asc     = th.dataset.sortDir !== 'asc';
          th.dataset.sortDir = asc ? 'asc' : 'desc';

          // Reset siblings
          headers.forEach(function (h) {
            if (h !== th) { delete h.dataset.sortDir; h.removeAttribute('aria-sort'); }
          });
          th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');

          var tbody = table.querySelector('tbody');
          var rows  = Array.from(tbody.querySelectorAll('tr'));
          rows.sort(function (a, b) {
            var av = (a.cells[col] || {}).textContent || '';
            var bv = (b.cells[col] || {}).textContent || '';
            var an = parseFloat(av.replace(/[^0-9.-]/g, ''));
            var bn = parseFloat(bv.replace(/[^0-9.-]/g, ''));
            if (!isNaN(an) && !isNaN(bn)) return asc ? an - bn : bn - an;
            return asc ? av.localeCompare(bv) : bv.localeCompare(av);
          });
          rows.forEach(function (r) { tbody.appendChild(r); });
        }

        th.addEventListener('click', doSort);
        th.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doSort(); }
        });
      });
    });
  });

  /* ================================================================
     CSV EXPORT  (.data-table-export buttons)
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-export-table]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tableId = btn.dataset.exportTable;
        var table   = document.getElementById(tableId) || document.querySelector('.data-table');
        if (!table) return;
        var rows = Array.from(table.querySelectorAll('tr'));
        var csv  = rows.map(function (row) {
          return Array.from(row.querySelectorAll('th,td')).map(function (cell) {
            return '"' + cell.textContent.replace(/"/g, '""').trim() + '"';
          }).join(',');
        }).join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href     = url;
        a.download = (tableId || 'export') + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  });

  /* ================================================================
     NOTIFICATIONS DROPDOWN  (mark-all-read)
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    var markAllBtn = document.getElementById('uc-notif-mark-all');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', function () {
        document.querySelectorAll('.notif-item.unread').forEach(function (el) {
          el.classList.remove('unread');
        });
        var badge = document.getElementById('uc-notif-badge');
        if (badge) badge.textContent = '0';
      });
    }
  });

  /* ================================================================
     BREADCRUMB ROW + LAST-REFRESH PILL
     Auto-injected as first child of #main-content after sidebar
     active link is known (relies on main.js setting .active class first
     — both scripts run after DOMContentLoaded).
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    // Defer slightly so main.js (loaded after) finishes setting .active on sidebar links
    setTimeout(function () {

    var mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Build breadcrumb from active sidebar link + its section label
    function buildBreadcrumb() {
      var activeLink = document.querySelector('.sidebar-link.active');
      var crumbs = [{ label: 'Home', href: 'dashboard.html' }];

      if (activeLink) {
        var isSublink = activeLink.classList.contains('sidebar-sublink');
        var walkFrom; // the element we walk backwards from to find section label

        if (isSublink) {
          // Active link is inside a .sidebar-submenu div
          // parent = the submenu div; its previousElementSibling = .has-submenu link
          var submenuDiv = activeLink.parentElement;
          var hasSubmenuLink = submenuDiv ? submenuDiv.previousElementSibling : null;
          if (hasSubmenuLink && hasSubmenuLink.classList.contains('has-submenu')) {
            var parentText = hasSubmenuLink.querySelector('.link-text');
            if (parentText) crumbs.push({ label: parentText.textContent.trim(), href: null });
          }
          walkFrom = hasSubmenuLink;
        } else {
          walkFrom = activeLink;
        }

        // Walk backwards from walkFrom to find nav-section-label
        var node = walkFrom ? walkFrom.previousElementSibling : null;
        while (node) {
          if (node.classList && node.classList.contains('nav-section-label')) {
            // Insert section after 'Home'
            crumbs.splice(1, 0, { label: node.textContent.trim(), href: null });
            break;
          }
          node = node.previousElementSibling;
        }

        var linkText = activeLink.querySelector('.link-text');
        var label = linkText ? linkText.textContent.trim() : '';
        if (label) crumbs.push({ label: label, href: null, current: true });
      }

      return crumbs;
    }

    function renderBreadcrumbs(crumbs) {
      return crumbs.map(function (c, i) {
        var isLast = (i === crumbs.length - 1);
        var part = isLast
          ? '<span class="bc-current">' + c.label + '</span>'
          : (c.href
              ? '<a href="' + c.href + '">' + c.label + '</a>'
              : '<span>' + c.label + '</span>');
        return part + (isLast ? '' : '<span class="bc-sep" aria-hidden="true">›</span>');
      }).join('');
    }

    // Build refresh pill
    var refreshStart = Date.now();
    function formatAge(ms) {
      var s = Math.floor(ms / 1000);
      if (s < 60)  return 'Updated just now';
      var m = Math.floor(s / 60);
      if (m < 60)  return 'Updated ' + m + ' min ago';
      var h = Math.floor(m / 60);
      return 'Updated ' + h + 'h ago';
    }

    // Inject row
    var row = document.createElement('div');
    row.className = 'uc-breadcrumb-row';
    row.id = 'uc-breadcrumb-row';

    var bcEl = document.createElement('nav');
    bcEl.className = 'uc-breadcrumb';
    bcEl.setAttribute('aria-label', 'Breadcrumb');
    bcEl.innerHTML = renderBreadcrumbs(buildBreadcrumb());

    var refreshPill = document.createElement('span');
    refreshPill.className = 'uc-refresh-pill';
    refreshPill.id = 'uc-refresh-pill';
    refreshPill.innerHTML = '<i data-lucide="refresh-cw"></i><span id="uc-refresh-text">' + formatAge(0) + '</span>';

    row.appendChild(bcEl);
    row.appendChild(refreshPill);
    mainContent.insertBefore(row, mainContent.firstChild);

    if (typeof lucide !== 'undefined') lucide.createIcons({ strokeWidth: 1.75 });

    // Tick the refresh label every 60 s
    setInterval(function () {
      var textEl = document.getElementById('uc-refresh-text');
      if (textEl) textEl.textContent = formatAge(Date.now() - refreshStart);
    }, 60000);

    }, 0); // end setTimeout — waits for main.js to set .active
  });

})();
