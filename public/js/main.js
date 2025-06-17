// public/js/main.js - Client-side JavaScript

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded with protocol:', window.location.protocol);
  
  // Fix for VM profile access issues - if on the profile page with HTTPS, switch to HTTP
  if (window.location.pathname.startsWith('/profile') && window.location.protocol === 'https:') {
    console.log('⚠️ Detected HTTPS on profile page. Switching to HTTP for compatibility.');
    const httpUrl = window.location.href.replace('https:', 'http:');
    console.log('Redirecting to:', httpUrl);
    window.location.href = httpUrl;
    return;
  }
  
  // Fix profile links to always use HTTP
  fixProfileLinks();
  // Enable all tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Auto dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
  // Form validation
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
});

// Fix all links to profile pages to use HTTP explicitly
function fixProfileLinks() {
  // Find all links going to profile pages
  const profileLinks = document.querySelectorAll('a[href^="/profile"]');
  
  profileLinks.forEach(link => {
    // Add a click handler to ensure HTTP protocol
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const profileUrl = 'http://' + window.location.host + link.getAttribute('href');
      console.log('Navigating to profile via:', profileUrl);
      window.location.href = profileUrl;
    });
  });
  
  console.log(`Fixed ${profileLinks.length} profile links to use HTTP`);
}
