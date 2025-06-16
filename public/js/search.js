// public/js/search.js - Client-side search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchResults = document.getElementById('search-results');
    const searchInput = document.getElementById('search-input');
    const apiSearchBtn = document.getElementById('api-search-btn');
    const tryApiSearchBtn = document.getElementById('try-api-search');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            
            if (query) {
                // Search both database and API if needed
                searchHeroes(query);
            }
        });
    }
    
    if (apiSearchBtn) {
        apiSearchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                // If user explicitly clicks API search button, search the Superhero API directly
                searchSuperheroAPI(query);
            }
        });
    }
    
    // If there's a "try API search" button, hook it up
    if (tryApiSearchBtn) {
        tryApiSearchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                searchSuperheroAPI(query);
            }
        });
    }
    
    // Main search function - searches database first, which will also search API if needed
    function searchHeroes(query) {
        searchResults.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Searching for "${query}"...</p>
            </div>
        `;
        
        fetch(`/api/heroes/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.heroes.length > 0) {
                    displayResults(data.heroes);
                } else {
                    // If no results found even after API search
                    searchResults.innerHTML = `
                        <div class="alert alert-info">
                            No heroes found for "${query}". Try a different search term.
                            <a href="/" class="btn btn-primary ms-2">Back to Homepage</a>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error searching heroes:', error);
                searchResults.innerHTML = `
                    <div class="alert alert-danger">
                        Error searching for heroes. Please try again.
                    </div>
                `;
            });
    }
    
    // Function to search the Superhero API directly (when button is clicked)
    function searchSuperheroAPI(query) {
        searchResults.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Searching the Superhero API directly...</p>
            </div>
        `;
        
        // Make a request to a server endpoint that will proxy the API request
        fetch(`/superhero/api-search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.heroes.length > 0) {
                    displayAPIResults(data.heroes, query);
                } else {
                    searchResults.innerHTML = `
                        <div class="alert alert-warning">
                            No heroes found in the Superhero API for "${query}".
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error searching Superhero API:', error);
                searchResults.innerHTML = `
                    <div class="alert alert-danger">
                        Error searching the Superhero API. Please try again.
                    </div>
                `;
            });
    }
    
    // Function to display local database results
    function displayResults(heroes) {
        let html = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">';
        
        heroes.forEach(hero => {
            const imageUrl = hero.image || '/images/hero-placeholder.jpg';
            const publisher = hero.publisher || 'Unknown Publisher';
            
            html += `
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-img-top hero-card-image" style="background-image: url('${imageUrl}');"></div>
                        <div class="card-body">
                            <h5 class="card-title">${hero.name}</h5>
                            <p class="card-text text-muted"><small>${publisher}</small></p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <a href="/superhero/${hero.id}" class="btn btn-primary btn-sm">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        searchResults.innerHTML = html;
    }
    
    // Function to display API results with option to add to database
    function displayAPIResults(heroes, query) {
        let html = `
            <div class="alert alert-success">
                Found ${heroes.length} heroes in the Superhero API for "${query}".
                Select heroes to add to your database:
            </div>
            <div class="mb-3">
                <button id="select-all-btn" class="btn btn-sm btn-outline-primary me-2">Select All</button>
                <button id="select-none-btn" class="btn btn-sm btn-outline-secondary">Select None</button>
                <button id="add-selected-btn" class="btn btn-sm btn-success float-end">Add Selected Heroes</button>
            </div>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        `;
        
        heroes.forEach(hero => {
            const imageUrl = hero.image?.url || '/images/hero-placeholder.jpg';
            const publisher = hero.biography?.publisher || 'Unknown Publisher';
            
            html += `
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="form-check form-check-inline position-absolute top-0 end-0 m-2">
                            <input class="form-check-input hero-select" type="checkbox" value="${hero.id}" id="select-${hero.id}">
                        </div>
                        <div class="card-img-top hero-card-image" style="background-image: url('${imageUrl}');"></div>
                        <div class="card-body">
                            <h5 class="card-title">${hero.name}</h5>
                            <p class="card-text text-muted"><small>${publisher}</small></p>
                            <div class="mt-3">
                                <span class="badge bg-info">#${hero.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        searchResults.innerHTML = html;
        
        // Add event listeners for selection buttons
        document.getElementById('select-all-btn').addEventListener('click', function() {
            document.querySelectorAll('.hero-select').forEach(checkbox => {
                checkbox.checked = true;
            });
        });
        
        document.getElementById('select-none-btn').addEventListener('click', function() {
            document.querySelectorAll('.hero-select').forEach(checkbox => {
                checkbox.checked = false;
            });
        });
        
        document.getElementById('add-selected-btn').addEventListener('click', function() {
            const selectedIds = [];
            document.querySelectorAll('.hero-select:checked').forEach(checkbox => {
                selectedIds.push(checkbox.value);
            });
            
            if (selectedIds.length === 0) {
                alert('Please select at least one hero to add.');
                return;
            }
            
            addHeroesToDatabase(selectedIds);
        });
    }
    
    // Function to add selected heroes to the database
    function addHeroesToDatabase(heroIds) {
        searchResults.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Adding ${heroIds.length} heroes to database...</p>
            </div>
        `;
        
        fetch('/superhero/add-to-database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ heroIds: heroIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                searchResults.innerHTML = `
                    <div class="alert alert-success">
                        Successfully added ${data.added} heroes to the database!
                        <a href="/" class="btn btn-primary ms-3">Go to Homepage</a>
                    </div>
                `;
            } else {
                searchResults.innerHTML = `
                    <div class="alert alert-warning">
                        ${data.message || 'Failed to add heroes to database.'}
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error adding heroes to database:', error);
            searchResults.innerHTML = `
                <div class="alert alert-danger">
                    Error adding heroes to database. Please try again.
                </div>
            `;
        });
    }
});
