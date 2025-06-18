// public/js/favorites.js - For handling favorite hero functionality

// Global initialization function to be called once on page load
// and again if new content is dynamically added
function initializeFavoritesFeatures() {
  // Handle favorite button animations
  const favoriteButtons = document.querySelectorAll('.favorite-button');
  favoriteButtons.forEach(button => {
    // Remove existing listeners to prevent duplicates
    button.removeEventListener('click', handleFavoriteButtonClick);
    // Add the event listener
    button.addEventListener('click', handleFavoriteButtonClick);
  });

  // Handle favorite modal buttons
  const modalTriggers = document.querySelectorAll('.show-favorite-modal');
  modalTriggers.forEach(button => {
    // Remove existing listeners to prevent duplicates
    button.removeEventListener('click', handleModalTriggerClick);
    // Add the event listener
    button.addEventListener('click', handleModalTriggerClick);
  });
  
  // Handle favorite modal submission from the details page
  const favoriteModal = document.getElementById('favoriteModal');
  if (favoriteModal) {
    const favoriteForm = favoriteModal.querySelector('form');
    if (favoriteForm) {
      // Remove existing listeners to prevent duplicates
      favoriteForm.removeEventListener('submit', handleFavoriteFormSubmit);
      // Add the event listener
      favoriteForm.addEventListener('submit', handleFavoriteFormSubmit);
    }
  }
  
  // Initialize tooltips with custom formatting
  initializeTooltips();
}

// Handle favorite button click animation
function handleFavoriteButtonClick() {
  // Add animation class
  this.classList.add('favorite-button-clicked');
  
  // Remove class after animation completes
  setTimeout(() => {
    this.classList.remove('favorite-button-clicked');
  }, 500);
}

// Handle modal trigger click
function handleModalTriggerClick(event) {
  event.preventDefault();
  
  const heroId = this.getAttribute('data-hero-id');
  const heroName = this.getAttribute('data-hero-name');
  const formAction = this.getAttribute('data-form-action');
  
  createFavoriteModal(heroId, heroName, formAction);
}

// Handle favorite form submission
function handleFavoriteFormSubmit(event) {
  // Get the reason text
  const reasonText = this.querySelector('textarea[name="reason"]').value.trim();
  
  // If the user hasn't provided a reason, ask for confirmation
  if (!reasonText && !confirm('Do you want to add this hero to favorites without adding a reason?')) {
    event.preventDefault();
  }
}

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeFavoritesFeatures);

// Also refresh tooltips when navigating with turbolinks if used
document.addEventListener('turbolinks:load', initializeFavoritesFeatures);

// Add a helper method to refresh tooltips after AJAX content loads
window.refreshFavoriteFeatures = initializeFavoritesFeatures;

// Function to create favorite modal on demand
function createFavoriteModal(heroId, heroName, formAction) {
  // Check if modal already exists
  let modal = document.getElementById('dynamicFavoriteModal');
  
  if (!modal) {
    // Create modal
    modal = document.createElement('div');
    modal.id = 'dynamicFavoriteModal';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    
    // Modal HTML
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add to Favorites</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form id="dynamic-favorite-form" method="POST">
            <div class="modal-body">
              <p>Add <strong id="hero-name-placeholder"></strong> to your favorites?</p>              <div class="mb-3">
                <label for="dynamic-reason" class="form-label">Why is this one of your favorite heroes? (Optional)</label>
                <textarea class="form-control favorite-reason-textarea" id="dynamic-reason" name="reason" rows="3" placeholder="Tell us why you like this hero..."></textarea>
                <small class="text-muted mt-1 d-block">Your reason will be displayed on your profile and hero detail pages.</small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Add to Favorites</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Append modal to body
    document.body.appendChild(modal);
    
    // Add event listener to the form
    const dynamicForm = modal.querySelector('#dynamic-favorite-form');
    dynamicForm.addEventListener('submit', function(event) {
      // Get the reason text
      const reasonText = document.getElementById('dynamic-reason').value.trim();
      
      // If the user hasn't provided a reason, ask for confirmation
      if (!reasonText && !confirm('Do you want to add this hero to favorites without adding a reason?')) {
        event.preventDefault();
      }
    });
  }
  
  // Set hero name and form action
  modal.querySelector('#hero-name-placeholder').textContent = heroName;
  modal.querySelector('#dynamic-favorite-form').action = formAction;
  
  // Initialize and show modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
  
  // Focus on the textarea
  modal.addEventListener('shown.bs.modal', function() {
    document.getElementById('dynamic-reason').focus();
  });
}

// Function to initialize tooltips - centralized version to avoid duplicates
function initializeTooltips() {
  // First destroy any existing tooltips to prevent duplicates
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"][data-bs-original-title]');
    [...existingTooltips].forEach(el => {
      const tooltipInstance = bootstrap.Tooltip.getInstance(el);
      if (tooltipInstance) {
        tooltipInstance.dispose();
      }
    });
    
    // Now initialize tooltips properly
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    
    [...tooltipTriggerList].forEach(tooltipTriggerEl => {
      // Check if this is a favorite button with a reason
      if (tooltipTriggerEl.classList.contains('favorite-button') && 
          tooltipTriggerEl.title && 
          tooltipTriggerEl.title.includes('Your reason:')) {
        
        // Extract the reason from the title
        let originalTitle = tooltipTriggerEl.title;
        let reason = originalTitle.replace('Your reason:', '').trim();
        
        // Create formatted tooltip content
        tooltipTriggerEl.setAttribute('data-bs-original-title', 
          `<div class="tooltip-reason-wrapper">${reason}</div>`
        );
        
        // Initialize tooltip with HTML enabled
        new bootstrap.Tooltip(tooltipTriggerEl, {
          html: true,
          placement: 'auto',
          container: 'body',
          boundary: 'window'
        });
      } else {
        // Regular tooltips
        new bootstrap.Tooltip(tooltipTriggerEl);
      }
    });
    
    console.log('All tooltips initialized successfully');
  }
}
