const API_KEY = '51446fbee347368b517c00612cbbe0b3';
const API_BASE_URL = 'https://api.themoviedb.org/3';

$(document).ready(function () {
    let currentView = 'grid-view';

    function fetchMovies(endpoint, params) {
        $.getJSON(`${API_BASE_URL}${endpoint}`, { ...params, api_key: API_KEY }, function (data) {
            displayMovies(data.results);
            setupPagination(data.page, data.total_pages);
        });
    }

    function fetchGenres() {
        $.getJSON(`${API_BASE_URL}/genre/movie/list`, { api_key: API_KEY }, function (data) {
            data.genres.forEach(genre => {
                $('#genre-filter').append(`<option value="${genre.id}">${genre.name}</option>`);
            });
        });
    }

    function displayMovies(movies) {
        $('#movie-list').empty().removeClass('grid-view list-view').addClass(currentView);

        movies.forEach(movie => {
            const movieCard = `
                <div class="movie-card">
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                    <h3>${movie.title}</h3>
                    <button data-id="${movie.id}" class="details-button">More Info</button>
                </div>
            `;
            $('#movie-list').append(movieCard);
        });
    }

    function displayMovieDetails(movie) {
        $('#movie-details').html(`
            <h2>${movie.title}</h2>
            <p>${movie.overview}</p>
            <ul id="reviews"></ul>
        `);
        fetchReviews(movie.id);
    }

    function fetchReviews(movieId) {
        $.getJSON(`${API_BASE_URL}/movie/${movieId}/reviews`, { api_key: API_KEY }, function (data) {
            $('#reviews').html(data.results.map(review => `<li>${review.content}</li>`).join(''));
        });
    }

    function fetchActorDetails(actorId) {
        $.getJSON(`${API_BASE_URL}/person/${actorId}`, { api_key: API_KEY }, function (actor) {
            $('#actor-details').html(`
                <h2>${actor.name}</h2>
                <p>${actor.biography}</p>
            `);
        });
    }

    function setupPagination(currentPage, totalPages) {
        $('#pagination').empty();
        for (let i = 1; i <= totalPages; i++) {
            $('#pagination').append(`<button class="page-button" data-page="${i}">${i}</button>`);
        }
    }

    $('#search-button').click(() => {
        const query = $('#search-input').val();
        fetchMovies('/search/movie', { query });
    });

    $('#popular-button').click(() => {
        fetchMovies('/movie/popular', {});
    });

    $('#genre-filter').change(function () {
        const genreId = $(this).val();
        fetchMovies('/discover/movie', { with_genres: genreId });
    });

    $('#sort-options').change(function () {
        const sortBy = $(this).val();
        fetchMovies('/discover/movie', { sort_by: sortBy });
    });

    $('#movie-list').on('click', '.details-button', function () {
        const movieId = $(this).data('id');
        $.getJSON(`${API_BASE_URL}/movie/${movieId}`, { api_key: API_KEY }, displayMovieDetails);
    });

    $('#pagination').on('click', '.page-button', function () {
        const page = $(this).data('page');
        fetchMovies('/movie/popular', { page });
    });

    $('#grid-view-button').click(() => {
        currentView = 'grid-view';
        $('#movie-list').addClass('grid-view').removeClass('list-view');
    });

    $('#list-view-button').click(() => {
        currentView = 'list-view';
        $('#movie-list').addClass('list-view').removeClass('grid-view');
    });

    fetchGenres();
    fetchMovies('/movie/popular', {});
});
