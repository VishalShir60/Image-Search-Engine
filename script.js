document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('results');
    const loadMoreBtn = document.getElementById('load-more');
    const orientationSelect = document.getElementById('orientation');
    const colorSelect = document.getElementById('color');
    
    // Unsplash API Configuration
    const ACCESS_KEY = "ebplYPk-oKNNkB85Bv9YR_seYud5JLBJgi_H43KOv30";
    const API_URL = "https://api.unsplash.com/search/photos";
    const PER_PAGE = 20;
    
    // State variables
    let currentPage = 1;
    let currentQuery = '';
    let currentOrientation = '';
    let currentColor = '';
    let totalPages = 1;

    // Initialize with default search
    searchImages('nature');

    // Main search function
    async function searchImages(query, page = 1, orientation = '', color = '') {
        if (!query || query.trim() === '') {
            showError("Please enter a search term");
            return;
        }

        try {
            showLoading(page === 1);
            
            const url = new URL(API_URL);
            url.searchParams.append('query', encodeURIComponent(query.trim()));
            url.searchParams.append('page', page);
            url.searchParams.append('per_page', PER_PAGE);
            url.searchParams.append('client_id', ACCESS_KEY);
            
            if (orientation) url.searchParams.append('orientation', orientation);
            if (color) url.searchParams.append('color', color);

            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors || `API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            totalPages = data.total_pages;
            
            if (page === 1) {
                resultsContainer.innerHTML = '';
                currentPage = 1;
            }
            
            if (data.results.length === 0) {
                showNoResults();
                return;
            }
            
            displayResults(data.results);
            updateLoadMoreButton();

        } catch (error) {
            console.error('Error:', error);
            showError(error.message);
        }
    }

    // Display results
    function displayResults(images) {
        images.forEach(image => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const img = document.createElement('img');
            img.src = image.urls.small;
            img.alt = image.alt_description || '';
            img.loading = 'lazy';
            
            const attribution = document.createElement('div');
            attribution.className = 'attribution';
            attribution.innerHTML = `
                <span>Photo by <a href="${image.user.links.html}?utm_source=ImageSearch&utm_medium=referral" target="_blank">${image.user.name}</a></span>
                <span>on <a href="https://unsplash.com/?utm_source=ImageSearch&utm_medium=referral" target="_blank">Unsplash</a></span>
            `;
            
            resultItem.appendChild(img);
            resultItem.appendChild(attribution);
            resultsContainer.appendChild(resultItem);
        });
    }

    // Helper functions
    function showLoading(initialLoad) {
        if (initialLoad) {
            resultsContainer.innerHTML = '<div class="loading"><div></div><div></div><div></div></div>';
        } else {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Loading...';
        }
    }

    function showNoResults() {
        resultsContainer.innerHTML = '<p class="no-results">No images found. Try a different search term.</p>';
        loadMoreBtn.style.display = 'none';
    }

    function showError(message) {
        resultsContainer.innerHTML = `
            <div class="error">
                <p>Failed to fetch images</p>
                <p class="error-detail">${message}</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
    }

    function updateLoadMoreButton() {
        if (totalPages > currentPage) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Event Listeners
    searchBtn.addEventListener('click', () => {
        currentQuery = searchInput.value.trim();
        currentOrientation = orientationSelect.value;
        currentColor = colorSelect.value;
        searchImages(currentQuery, 1, currentOrientation, currentColor);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentQuery = searchInput.value.trim();
            currentOrientation = orientationSelect.value;
            currentColor = colorSelect.value;
            searchImages(currentQuery, 1, currentOrientation, currentColor);
        }
    });

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        searchImages(currentQuery, currentPage, currentOrientation, currentColor);
    });

    orientationSelect.addEventListener('change', () => {
        if (currentQuery) {
            currentOrientation = orientationSelect.value;
            searchImages(currentQuery, 1, currentOrientation, currentColor);
        }
    });

    colorSelect.addEventListener('change', () => {
        if (currentQuery) {
            currentColor = colorSelect.value;
            searchImages(currentQuery, 1, currentOrientation, currentColor);
        }
    });
});