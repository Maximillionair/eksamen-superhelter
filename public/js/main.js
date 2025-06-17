// public/js/main.js - Client-side JavaScript

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Check and fix protocol if needed
  if (window.location.protocol === 'https:' && 
      !window.location.host.includes('github.io') && 
      !window.location.host.includes('herokuapp.com')) {
    console.log('Detected HTTPS on non-production host. Switching to HTTP.');
    window.location.href = window.location.href.replace('https:', 'http:');
    return;
  }
  
  console.log('Page loaded with protocol:', window.location.protocol);
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
