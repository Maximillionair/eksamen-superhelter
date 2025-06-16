/**
 * stats.js - Handle accurate power stat displays
 */

document.addEventListener('DOMContentLoaded', function() {
  // Find all power stat bars
  const statBars = document.querySelectorAll('.progress-bar[data-stat]');
  
  // Update each bar with its accurate width
  statBars.forEach(bar => {
    const statValue = parseInt(bar.getAttribute('data-stat')) || 0;
    
    // Animate the bars
    setTimeout(() => {
      bar.style.width = `${statValue}%`;
    }, 100);
  });
});
