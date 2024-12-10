document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = "http://localhost:5006/api/Movie"; // Cambia el puerto si es necesario
    const filterButtons = document.querySelectorAll('.filter-button');
    const moviesContainer = document.querySelector('.movies__container');

    // Función para obtener las películas según el filtro
    async function fetchMovies(filter) {
        let url = `${API_BASE_URL}/GetPeliculas`; // Default: todas las películas

        switch (filter) {
            case 'inTheater':
                url = `${API_BASE_URL}/GetPeliculasEnCartelera`;
                break;
            case 'comingSoon':
                url = `${API_BASE_URL}/GetPeliculasProximas`;
                break;
            case 'preSale':
                url = `${API_BASE_URL}/GetPeliculasEnVentaAnticipada`;
                break;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const movies = await response.json();
            renderMovies(movies);
        } catch (error) {
            console.error('Error al cargar las películas:', error);
            moviesContainer.innerHTML = `<p class="error-message">No se pudieron cargar las películas.</p>`;
        }
    }

    // Función para renderizar las películas
    function renderMovies(movies) {
        moviesContainer.innerHTML = ''; // Limpiar el contenedor

        // Eliminar duplicados por ID
        const uniqueMovies = Array.from(new Map(movies.map(movie => [movie.id, movie])).values());

        if (!uniqueMovies.length) {
            moviesContainer.innerHTML = `<p class="error-message">No hay películas disponibles para este filtro.</p>`;
            return;
        }

        uniqueMovies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('data-movie-id', movie.id); // Asignar el ID de la película

            movieCard.innerHTML = `
                <img src="${movie.cartel}" alt="${movie.titulo}" class="movie-card__image">
                <h3 class="movie-card__title">${movie.titulo.toUpperCase()}</h3>
            `;

            moviesContainer.appendChild(movieCard);
        });
    }

    // Delegación de eventos para manejar clics en las tarjetas de películas
    moviesContainer.addEventListener('click', (event) => {
        const movieCard = event.target.closest('.movie-card'); // Buscar la tarjeta más cercana
        if (movieCard) {
            const movieId = movieCard.getAttribute('data-movie-id'); // Obtener el ID de la película
            if (movieId) {
                window.location.href = `Peliculas.html?id=${movieId}`; // Redirigir a Peliculas.html con el ID
            } else {
                console.error("No se encontró el ID de la película en la tarjeta seleccionada.");
            }
        }
    });

    // Evento para cambiar de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Cambiar el botón activo
            filterButtons.forEach(btn => btn.classList.remove('active')); // Eliminar clase `active` de todos
            button.classList.add('active'); // Añadir clase `active` al botón seleccionado

            // Obtener películas según el filtro
            const filter = button.dataset.filter;

            // Guardar el filtro seleccionado en localStorage
            localStorage.setItem('selectedFilter', filter);

            fetchMovies(filter);
        });
    });

    // Cargar el filtro guardado o usar el filtro "all" por defecto
    const savedFilter = localStorage.getItem('selectedFilter') || 'all';
    const activeButton = document.querySelector(`[data-filter="${savedFilter}"]`);

    // Eliminar la clase `active` de todos los botones
    filterButtons.forEach(btn => btn.classList.remove('active'));

    // Asignar la clase `active` al botón del filtro seleccionado
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Cargar las películas según el filtro seleccionado
    fetchMovies(savedFilter);
});




async function loadMovies() {
    try {
        // Obtener el filtro guardado del localStorage, o usar "all" por defecto
        const savedFilter = localStorage.getItem('selectedFilter') || 'all';
        let url = 'http://localhost:5006/api/Movie/GetPeliculas'; // Default: todas las películas

        // Ajustar la URL según el filtro seleccionado
        switch (savedFilter) {
            case 'inTheater':
                url = 'http://localhost:5006/api/Movie/GetPeliculasEnCartelera';
                break;
            case 'comingSoon':
                url = 'http://localhost:5006/api/Movie/GetPeliculasProximas';
                break;
            case 'preSale':
                url = 'http://localhost:5006/api/Movie/GetPeliculasEnVentaAnticipada';
                break;
        }

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const movies = await response.json();

        const moviesContainer = document.querySelector('.movies__container');
        moviesContainer.innerHTML = ''; // Limpia el contenedor antes de añadir las películas

        const movieIds = new Set(); // Conjunto para almacenar IDs únicos de películas

        movies.forEach((movie) => {
            if (movieIds.has(movie.id)) return; // Evitar duplicados
            movieIds.add(movie.id);

            // Crear tarjeta de película
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            // Imagen de la película
            const img = document.createElement('img');
            img.src = movie.cartel; // Usa movie.cartel directamente
            img.alt = movie.titulo;
            img.classList.add('movie-card__image');

            // Redirección al hacer clic
            img.addEventListener('click', () => {
                window.location.href = `Peliculas.html?id=${movie.id}`; // Redirección a Peliculas.html con la ID de la película
            });

            // Título de la película
            const title = document.createElement('h3');
            title.classList.add('movie-card__title');
            title.textContent = movie.titulo;

            // Añadir imagen y título a la tarjeta
            movieCard.appendChild(img);
            movieCard.appendChild(title);

            // Añadir la tarjeta al contenedor
            moviesContainer.appendChild(movieCard);
        });

        // Sincronizar visualmente el botón activo
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-filter="${savedFilter}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    } catch (error) {
        console.error("Error loading movies:", error);
    }
}

// Llama a la función para cargar las películas cuando la página se carga
document.addEventListener('DOMContentLoaded', loadMovies);

