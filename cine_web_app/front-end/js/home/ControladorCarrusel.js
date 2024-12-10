async function loadMovies() {
    try {
        const response = await fetch('http://localhost:5006/api/Movie/GetPeliculas', {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const movies = await response.json();

        const carouselTrack = document.getElementById('carousel-track');
        carouselTrack.innerHTML = ''; // Limpia el carrusel antes de añadir las películas

        const movieIds = new Set(); // Conjunto para almacenar IDs únicos de películas

        movies.forEach(movie => {
            if (movieIds.has(movie.id)) return; // Evitar duplicados
            movieIds.add(movie.id);

            // Crea un elemento de lista para cada película
            const listItem = document.createElement('li');
            listItem.classList.add('carousel__slide', 'item'); // Añade clase necesaria para Owl Carousel

            // Imagen de la película
            const img = document.createElement('img');
            img.src = movie.cartel;
            img.alt = movie.titulo;
            img.classList.add('carousel__image');

            // Redirección al hacer clic
            img.addEventListener('click', () => {
                window.location.href = `Peliculas.html?id=${movie.id}`;
            });

            // Título de la película
            const title = document.createElement('p');
            title.classList.add('carousel__title');
            title.textContent = movie.titulo;

            listItem.appendChild(img);
            listItem.appendChild(title);
            carouselTrack.appendChild(listItem);
        });

        initializeCarousel(); // Inicializa el carrusel con Owl Carousel
    } catch (error) {
        console.error("Error loading movies:", error);
    }
}

function initializeCarousel() {
    const track = $('#carousel-track');
    const isMobile = window.innerWidth <= 768; // Detectar si es móvil

    // Inicializar Owl Carousel
    track.owlCarousel({
        loop: true,
        margin: 10,
        nav: false, // Siempre deshabilitamos la navegación por defecto
        mouseDrag: isMobile, // Habilitar drag solo en móvil
        touchDrag: isMobile, // Habilitar drag táctil solo en móvil
        responsive: {
            0: { items: 1 }, // 1 elemento en pantallas pequeñas
            600: { items: 2 }, // 2 elementos en pantallas medianas
            1000: { items: 3 }, // 3 elementos en pantallas grandes
            1200: { items: 5 } // 5 elementos en pantallas muy grandes
        }
    });

    if (!isMobile) {
        // Si no es móvil, conectamos los botones personalizados
        $('.carousel__button--right').click(function () {
            track.trigger('next.owl.carousel'); // Navegar al siguiente elemento
        });

        $('.carousel__button--left').click(function () {
            track.trigger('prev.owl.carousel'); // Navegar al elemento anterior
        });
    } else {
        // Ocultar las flechas en móvil
        $('.carousel__button--left, .carousel__button--right').hide();
    }
}

// Llama a la función para cargar las películas
document.addEventListener('DOMContentLoaded', loadMovies);
