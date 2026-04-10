$(document).ready(function() {
    // Sidebar Toggle
    $('#sidebarToggle').on('click', function() {
        if ($(window).width() > 768) {
            $('.sidebar').toggleClass('collapsed');
        } else {
            $('.sidebar').toggleClass('show');
        }
    });

    // Close sidebar on mobile when clicking outside
    $(document).on('click', function(e) {
        if ($(window).width() <= 768) {
            if (!$(e.target).closest('.sidebar').length && !$(e.target).closest('.sidebar-toggle').length) {
                $('.sidebar').removeClass('show');
            }
        }
    });

    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    });
});
