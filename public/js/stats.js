/**
 * stats.js - Handle accurate power stat displays
 */

document.addEventListener('DOMContentLoaded', function() {
  // Find all power stat bars
  const statBars = document.querySelectorAll('.progress-bar[data-stat]');
  
  // Update each bar with its accurate width
  statBars.forEach(bar => {
    const statValue = parseInt(bar.getAttribute('data-stat')) || 0;
    bar.style.width = `${statValue}%`;
    
    // Add appropriate text color based on contrast needs
    if (statValue < 30) {
      bar.classList.add('text-dark');
    }
  });
});
