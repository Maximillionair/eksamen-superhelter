/**
 * theme.js - Theme switching functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check for saved theme preference or use default dark theme
  const currentTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(currentTheme);
  
  // Add theme toggle function for future use
  window.toggleTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
  }
});

// Apply selected theme
function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
}
