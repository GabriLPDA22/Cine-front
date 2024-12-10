document.addEventListener("DOMContentLoaded", () => {
    const daySelector = document.getElementById("day-selector");
    const showtimesContainer = document.getElementById("showtimes-container");
    let diaSeleccionado; // Variable para almacenar el día actualmente seleccionado

    // Obtén el cineId de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const cineId = urlParams.get("cineId"); // Captura cineId dinámicamente
    const movieId = urlParams.get('id'); // Captura movieId dinámicamente

    async function fetchMovies() {
        try {
            const response = await fetch("http://localhost:5006/api/Movie/GetPeliculas");
            if (!response.ok) throw new Error("Error al obtener detalles de las películas");
            const peliculas = await response.json();

            // Filtrar las películas duplicadas por su título
            const peliculasUnicas = peliculas.filter(
                (movie, index, self) =>
                    index === self.findIndex((m) => m.titulo === movie.titulo)
            );

            renderMovieDetails(peliculasUnicas[0]); // Mostrar la primera película inicialmente
            setupCarousel(peliculasUnicas);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    function renderMovieDetails(movie) {
        document.querySelector(".cine-detail__info-title").textContent = movie.titulo;
        document.querySelector(".cine-detail__info-metadata").innerHTML = `
            <span>IMDB ${movie.calificacion}</span> | <span>${movie.fechaEstreno.slice(0, 10)}</span> | <span>${movie.duracion}</span> | <span>${movie.genero}</span>
        `;
        document.querySelector(".cine-detail__info-description").textContent = movie.descripcion;

        const background = document.querySelector(".cine-detail__background");
        background.style.backgroundImage = `url(${movie.imagen})`;
        background.style.opacity = "1";

        // Renderizar sesiones para el cine actual
        const cineName = movie.sesiones && Object.keys(movie.sesiones).find(key => key.includes("Gran Casa")); // Ejemplo para detectar dinámicamente
        const sessions = cineName ? movie.sesiones[cineName] : null;

        if (sessions) {
            renderDayButtons(sessions);
        } else {
            daySelector.innerHTML = "<p>No hay sesiones disponibles para este cine.</p>";
        }
    }

    function renderDayButtons(sessions) {
        daySelector.innerHTML = "";
        const days = Object.keys(sessions);

        days.forEach((day, index) => {
            const dayButton = document.createElement("button");
            dayButton.classList.add("day-button");
            if (index === 0) dayButton.classList.add("active");
            dayButton.textContent = formatDate(day);
            dayButton.dataset.date = day;

            dayButton.addEventListener("click", () => {
                document.querySelectorAll(".day-button").forEach((btn) => btn.classList.remove("active"));
                dayButton.classList.add("active");

                diaSeleccionado = day; // Actualiza el día seleccionado
                renderShowtimes(sessions, day);
            });

            daySelector.appendChild(dayButton);
        });

        // Renderiza la primera sesión por defecto
        diaSeleccionado = days[0];
        renderShowtimes(sessions, days[0]);
    }

    function renderShowtimes(sessions, day) {
        showtimesContainer.innerHTML = "";
        const sesionesPorDia = sessions[day];

        if (!Array.isArray(sesionesPorDia) || sesionesPorDia.length === 0) {
            showtimesContainer.innerHTML = "<p>No hay sesiones disponibles para este día.</p>";
            return;
        }

        sesionesPorDia.forEach((sesion) => {
            const sessionDiv = document.createElement("div");
            sessionDiv.classList.add("session");

            const timeDiv = document.createElement("div");
            timeDiv.classList.add("session__time");
            timeDiv.textContent = sesion.hora;
            sessionDiv.appendChild(timeDiv);

            const roomDiv = document.createElement("div");
            roomDiv.classList.add("session__room");
            roomDiv.textContent = `Sala ${sesion.sala} ${sesion.esISense ? "iSense" : ""}`;
            sessionDiv.appendChild(roomDiv);

            if (sesion.esVOSE) {
                const voseDiv = document.createElement("div");
                voseDiv.classList.add("session__tag", "session__tag--vose");
                voseDiv.textContent = "VOSE";
                sessionDiv.appendChild(voseDiv);
            }

            if (sesion.esISense) {
                const isenseDiv = document.createElement("div");
                isenseDiv.classList.add("session__tag", "session__tag--isense");
                isenseDiv.textContent = "iSense";
                sessionDiv.appendChild(isenseDiv);
            }

            sessionDiv.addEventListener("click", () => {
                const queryParams = new URLSearchParams({
                    cineName: "Gran Casa", // Cambia según el cine seleccionado dinámicamente
                    movieTitle: document.querySelector(".cine-detail__info-title").textContent,
                    date: diaSeleccionado || day,
                    time: sesion.hora,
                    room: sesion.sala,
                    sesionId: sesion.id, // Añadir el ID de la sesión
                    cineId: cineId // Incluir el cineId
                });

                // Redirigir a la página de butacas
                window.location.href = `/cine_web_app/front-end/views/Butacas.html?${queryParams.toString()}`;
            });

            showtimesContainer.appendChild(sessionDiv);
        });
    }

    function formatDate(dateString) {
        const options = { weekday: "short", day: "numeric", month: "short" };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    }

    function setupCarousel(peliculas) {
        const track = $("#carousel-track");
        const isMobile = window.innerWidth <= 768; // Detectar si es móvil
        const isMacScreen = window.innerWidth > 1440; // Detectar si es pantalla Mac o grande

        // Crear los slides del carrusel dinámicamente
        peliculas.forEach((movie, index) => {
            const slide = `
            <li class="carousel__slide" data-index="${index}" data-title="${movie.titulo}" data-id="${movie.id}">
                <a href="/cine_web_app/front-end/views/Peliculas.html?id=${movie.id}&cineId=${cineId}" class="carousel__link">
                    <img src="${movie.cartel}" alt="${movie.titulo}" class="carousel__image">
                </a>
            </li>`;
            track.append(slide);
        });

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

        track.on("changed.owl.carousel", function (event) {
            const currentIndex = event.item.index - event.relatedTarget._clones.length / 2;
            const realIndex = (currentIndex + peliculas.length) % peliculas.length;
            const currentMovie = peliculas[realIndex];

            renderMovieDetails(currentMovie);

            $(".carousel__slide").removeClass("selected");
            $(`.carousel__slide[data-index="${realIndex}"]`).addClass("selected");
        });

        if (!isMobile) {
            $(".carousel__button--left").on("click", function () {
                track.trigger("prev.owl.carousel");
            });
            $(".carousel__button--right").on("click", function () {
                track.trigger("next.owl.carousel");
            });
        }
    }

    fetchMovies();
});
