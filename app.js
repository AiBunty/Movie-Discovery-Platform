/**
 * Movie Discovery Platform
 * A modern, responsive movie discovery app using TMDB API
 */

// ========================
// Configuration & State
// ========================

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const FALLBACK_POSTER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%23374151" width="300" height="450"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%239CA3AF" font-size="18" font-family="sans-serif"%3ENo Poster%3C/text%3E%3C/svg%3E';

// Application state
const state = {
    currentCategory: 'trending',
    currentPage: 1,
    totalPages: 1,
    searchQuery: '',
    selectedGenre: '',
    genres: [],
    isLoading: false,
};

// ========================
// Utility Functions
// ========================

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay = 500) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Fetch helper with Bearer token authentication
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
async function fetchFromTMDB(endpoint, params = {}) {
    if (!window.TMDB_TOKEN) {
        throw new Error('TMDB API token not found. Please set window.TMDB_TOKEN');
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${TMDB_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${window.TMDB_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get poster URL with fallback
 * @param {string} posterPath - Poster path from TMDB
 * @returns {string} Full poster URL
 */
function getPosterUrl(posterPath) {
    return posterPath 
        ? `${TMDB_IMAGE_BASE}/w500${posterPath}` 
        : FALLBACK_POSTER;
}

/**
 * Format vote average to 1 decimal place
 * @param {number} voteAverage - Vote average from TMDB
 * @returns {string} Formatted rating
 */
function formatRating(voteAverage) {
    return voteAverage ? voteAverage.toFixed(1) : 'N/A';
}

/**
 * Get star rating color based on score
 * @param {number} rating - Rating score
 * @returns {string} Tailwind color class
 */
function getRatingColor(rating) {
    if (rating >= 7.5) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-red-400';
}

// ========================
// UI Functions
// ========================

/**
 * Show status message (error or info)
 * @param {string} message - Message to display
 * @param {string} type - 'error' or 'info'
 */
function showStatus(message, type = 'info') {
    const statusBar = document.getElementById('statusBar');
    const bgColor = type === 'error' ? 'bg-red-900/50 border-red-700' : 'bg-blue-900/50 border-blue-700';
    
    statusBar.innerHTML = `
        <div class="p-4 ${bgColor} border rounded-lg">
            <p class="text-center">${message}</p>
        </div>
    `;
    statusBar.classList.remove('hidden');
}

/**
 * Hide status message
 */
function hideStatus() {
    document.getElementById('statusBar').classList.add('hidden');
}

/**
 * Render skeleton loading cards
 * @param {number} count - Number of skeleton cards to show
 */
function renderSkeletons(count = 12) {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'bg-gray-800 rounded-lg overflow-hidden border border-gray-700';
        skeletonCard.innerHTML = `
            <div class="skeleton w-full aspect-[2/3]"></div>
            <div class="p-4 space-y-3">
                <div class="skeleton h-6 w-3/4 rounded"></div>
                <div class="skeleton h-4 w-1/4 rounded"></div>
                <div class="skeleton h-4 w-full rounded"></div>
                <div class="skeleton h-4 w-5/6 rounded"></div>
            </div>
        `;
        grid.appendChild(skeletonCard);
    }
}

/**
 * Render movies to the grid
 * @param {Array} movies - Array of movie objects
 */
function renderMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    
    if (!movies || movies.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <p class="text-2xl text-gray-400">No movies found</p>
                <p class="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = movies.map(movie => {
        const rating = formatRating(movie.vote_average);
        const ratingColor = getRatingColor(movie.vote_average);
        
        return `
            <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 hover:scale-105 hover:shadow-2xl transform transition-all duration-200 cursor-pointer group">
                <div class="relative overflow-hidden aspect-[2/3]">
                    <img 
                        src="${getPosterUrl(movie.poster_path)}" 
                        alt="${movie.title}"
                        loading="lazy"
                        decoding="async"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onerror="this.src='${FALLBACK_POSTER}'"
                    />
                    <div class="absolute top-2 right-2 bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <svg class="w-4 h-4 ${ratingColor}" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span class="text-sm font-semibold ${ratingColor}">${rating}</span>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-2 text-gray-100 truncate" title="${movie.title}">
                        ${movie.title}
                    </h3>
                    <p class="text-sm text-gray-400 mb-2">
                        ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                    </p>
                    <p class="text-sm text-gray-300 line-clamp-3">
                        ${movie.overview || 'No overview available.'}
                    </p>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Update pagination UI state
 */
function updatePaginationUI() {
    document.getElementById('pageInfo').textContent = `Page ${state.currentPage} of ${state.totalPages}`;
    document.getElementById('prevBtn').disabled = state.currentPage === 1 || state.isLoading;
    document.getElementById('nextBtn').disabled = state.currentPage >= state.totalPages || state.isLoading;
}

// ========================
// Data Loading Functions
// ========================

/**
 * Load genres from TMDB API
 */
async function loadGenres() {
    try {
        const data = await fetchFromTMDB('/genre/movie/list');
        state.genres = data.genres;
        
        // Populate genre dropdown
        const genreSelect = document.getElementById('genreSelect');
        genreSelect.innerHTML = '<option value="">All Genres</option>' +
            state.genres.map(genre => 
                `<option value="${genre.id}">${genre.name}</option>`
            ).join('');
            
    } catch (error) {
        console.error('Failed to load genres:', error);
        // Continue without genres - not critical
    }
}

/**
 * Load movies based on current state
 */
async function loadMovies() {
    if (state.isLoading) return;
    
    state.isLoading = true;
    renderSkeletons();
    hideStatus();
    updatePaginationUI();
    
    try {
        let endpoint;
        const params = {
            page: state.currentPage,
        };
        
        // Determine endpoint based on search query or category
        if (state.searchQuery) {
            endpoint = '/search/movie';
            params.query = state.searchQuery;
        } else {
            switch (state.currentCategory) {
                case 'trending':
                    endpoint = '/trending/movie/week';
                    break;
                case 'popular':
                    endpoint = '/movie/popular';
                    break;
                case 'top_rated':
                    endpoint = '/movie/top_rated';
                    break;
                default:
                    endpoint = '/trending/movie/week';
            }
        }
        
        // Add genre filter if selected
        if (state.selectedGenre) {
            params.with_genres = state.selectedGenre;
        }
        
        const data = await fetchFromTMDB(endpoint, params);
        
        // Update state
        state.totalPages = Math.min(data.total_pages || 1, 500); // TMDB limits to 500 pages
        
        // Render movies
        renderMovies(data.results);
        updatePaginationUI();
        
    } catch (error) {
        console.error('Failed to load movies:', error);
        showStatus(
            error.message || 'Failed to load movies. Please check your API token and try again.',
            'error'
        );
        document.getElementById('moviesGrid').innerHTML = '';
    } finally {
        state.isLoading = false;
        updatePaginationUI();
    }
}

/**
 * Handle search input
 */
const handleSearch = debounce((query) => {
    state.searchQuery = query.trim();
    state.currentPage = 1;
    loadMovies();
}, 500);

/**
 * Handle category change
 */
function handleCategoryChange(category) {
    state.currentCategory = category;
    state.searchQuery = '';
    state.currentPage = 1;
    document.getElementById('searchInput').value = '';
    loadMovies();
}

/**
 * Handle genre change
 */
function handleGenreChange(genreId) {
    state.selectedGenre = genreId;
    state.currentPage = 1;
    loadMovies();
}

/**
 * Handle pagination
 */
function goToPage(direction) {
    if (direction === 'next' && state.currentPage < state.totalPages) {
        state.currentPage++;
        loadMovies();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (direction === 'prev' && state.currentPage > 1) {
        state.currentPage--;
        loadMovies();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ========================
// Event Listeners
// ========================

function initializeEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });
    
    // Category dropdown
    document.getElementById('categorySelect').addEventListener('change', (e) => {
        handleCategoryChange(e.target.value);
    });
    
    // Genre dropdown
    document.getElementById('genreSelect').addEventListener('change', (e) => {
        handleGenreChange(e.target.value);
    });
    
    // Pagination buttons
    document.getElementById('prevBtn').addEventListener('click', () => {
        goToPage('prev');
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        goToPage('next');
    });
}

// ========================
// Application Initialization
// ========================

/**
 * Initialize the application
 */
async function init() {
    // Check for API token
    if (!window.TMDB_TOKEN) {
        showStatus(
            'TMDB API token not configured. Please set window.TMDB_TOKEN in your browser console or configuration.',
            'error'
        );
        return;
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load initial data
    await loadGenres();
    await loadMovies();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
