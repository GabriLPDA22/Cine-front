// Obtén el ID de la película y el cine desde la URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id'); // ID de la película
const cineId = urlParams.get('cineId'); // ID del cine

// Variables globales
let cineSeleccionado = null;
let diaSeleccionado = null; // No hay día seleccionado al inicio
const daySelector = document.getElementById("day-selector");
const showtimesContainer = document.getElementById("showtimes-container");

// Oculta los elementos relacionados con sesiones y días al cargar la página
if (daySelector) daySelector.style.display = "none";
if (showtimesContainer) showtimesContainer.style.display = "none";

// Función para cargar los detalles de la película
async function loadMovieDetails(id) {
    try {
        const response = await fetch(`http://localhost:5006/api/Movie/GetPeliculaById?id=${id}`);
        if (!response.ok) throw new Error(`Error al obtener la película: ${response.status}`);

        const movie = await response.json();
        console.log('Datos de la película:', movie);

        // Asigna datos de la película a los elementos HTML
        document.getElementById('movie-banner').src = movie.imagen;
        document.getElementById('movie-poster').src = movie.cartel;
        document.getElementById('movie-title').textContent = movie.titulo;
        document.getElementById('movie-director').textContent = movie.director;
        document.getElementById('movie-actors').textContent = movie.actores;
        document.getElementById('movie-description').textContent = movie.descripcion;
        document.getElementById('movie-duration').textContent = movie.duracion;
        document.getElementById('movie-release-date').textContent = movie.fechaEstreno;
        document.getElementById('movie-genre').textContent = movie.genero;
        document.getElementById('movie-rating').textContent = movie.calificacion;

        const ageRatingIcon = document.getElementById('age-rating-icon');
        ageRatingIcon.src = movie.imagenEdadRecomendada;
        ageRatingIcon.alt = `Clasificación +${movie.edadRecomendada}`;
    } catch (error) {
        console.error("Error al cargar los detalles de la película:", error);
    }
}

// Función para cargar el nombre del cine y actualizar la UI
async function fetchCinemaName(cineId) {
    try {
        if (!cineId) {
            console.warn("No se detectó cineId en la URL.");
            showtimesContainer.innerHTML = "<p>Por favor, selecciona un cine para ver las sesiones disponibles.</p>";
            return;
        }

        const response = await fetch(`http://localhost:5006/api/Cine/GetCineById?cineId=${cineId}`);
        if (!response.ok) throw new Error('Error al obtener el cine');

        const cine = await response.json();
        console.log("Cine encontrado:", cine);

        // Actualizar la UI con el nombre del cine
        const locationSpan = document.querySelector(".location span");
        if (locationSpan) locationSpan.textContent = cine.nombre;

        // Guardar el nombre del cine seleccionado
        cineSeleccionado = cine.nombre;

        // Mostrar elementos relacionados con sesiones
        if (daySelector) daySelector.style.display = "flex";
        if (showtimesContainer) showtimesContainer.style.display = "flex";

        // Cargar los días y las sesiones del cine seleccionado
        loadDaysAndSessions(cine.id);
    } catch (error) {
        console.error("Error al obtener el cine:", error);
    }
}

// Abre el modal para selección de cine
function openCinemaModal() {
    document.getElementById("cinema-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    loadCinemas();
}

// Cierra el modal de selección de cine
function closeCinemaModal() {
    document.getElementById("cinema-modal").classList.add("hidden");
    document.body.style.overflow = "auto";
}

// Cargar la lista de cines desde el backend
async function loadCinemas() {
    try {
        const response = await fetch('http://localhost:5006/api/Cine/GetCines');
        if (!response.ok) throw new Error('Error al cargar los cines');

        const cinemas = await response.json();
        const cinemaList = document.getElementById("cinema-list");
        cinemaList.innerHTML = "";

        cinemas.forEach(cine => {
            const li = document.createElement("li");
            li.textContent = cine.nombre;
            li.dataset.cineId = cine.id;

            li.addEventListener("click", () => {
                selectCinema(cine.nombre, cine.id);
                closeCinemaModal();
            });

            cinemaList.appendChild(li);
        });
    } catch (error) {
        console.error("Error al cargar los cines:", error);
    }
}

// Seleccionar un cine y actualizar la interfaz
async function selectCinema(cinemaName, cinemaId) {
    try {
        cineSeleccionado = cinemaName; // Actualizar el cine seleccionado globalmente
        document.querySelector(".location span").textContent = cinemaName; // Actualizar en la interfaz

        // Mostrar los elementos de día y sesiones
        if (daySelector) daySelector.style.display = "flex";
        if (showtimesContainer) showtimesContainer.style.display = "flex";

        // Cargar los días y las sesiones del cine seleccionado
        await loadDaysAndSessions(cinemaId);
    } catch (error) {
        console.error("Error al seleccionar el cine:", error);
    }
}

// Cargar los días y las sesiones
async function loadDaysAndSessions(cineId) {
    try {
        if (!cineId) {
            console.error("No se detectó cineId.");
            showtimesContainer.innerHTML = "<p>Por favor, selecciona un cine para ver las sesiones disponibles.</p>";
            daySelector.innerHTML = "";
            return;
        }

        const response = await fetch(`http://localhost:5006/api/Cine/GetCineConPeliculas?cineId=${cineId}`);
        if (!response.ok) throw new Error('Error al cargar las películas del cine');

        const cine = await response.json();
        daySelector.innerHTML = "";

        const fechasUnicas = new Set();

        cine.peliculas.forEach(pelicula => {
            const sesionesPorCine = pelicula.sesiones[cineSeleccionado];
            if (!sesionesPorCine) return;

            Object.keys(sesionesPorCine).forEach(day => {
                fechasUnicas.add(day);
            });
        });

        [...fechasUnicas].sort().forEach((day, index) => {
            const dayButton = document.createElement("button");
            dayButton.classList.add("day-button");
            if (index === 0) {
                dayButton.classList.add("active");
                diaSeleccionado = day; // Seleccionar automáticamente el primer día
            }
            dayButton.textContent = formatDate(day);
            dayButton.dataset.date = day;

            dayButton.addEventListener("click", () => {
                document.querySelectorAll(".day-button").forEach(btn => btn.classList.remove("active"));
                dayButton.classList.add("active");

                renderShowtimesByDate(day, cineId); // Renderizar las sesiones del día seleccionado
            });

            daySelector.appendChild(dayButton);
        });

        // Renderizar las sesiones del primer día por defecto
        if (fechasUnicas.size > 0) renderShowtimesByDate([...fechasUnicas][0], cineId);
    } catch (error) {
        console.error("Error al cargar días y sesiones:", error);
    }
}

// Renderizar sesiones por fecha
async function renderShowtimesByDate(day, cineId) {
    try {
        if (!cineId) {
            console.error("No se encontró cineId para renderizar las sesiones.");
            return;
        }

        const response = await fetch(`http://localhost:5006/api/Cine/GetCineConPeliculas?cineId=${cineId}`);
        if (!response.ok) throw new Error('Error al cargar las sesiones del cine');

        const cine = await response.json();
        showtimesContainer.innerHTML = "";

        const peliculaSeleccionada = cine.peliculas.find(pelicula => pelicula.id === parseInt(movieId));
        if (!peliculaSeleccionada) {
            console.error("No se encontró la película seleccionada.");
            showtimesContainer.innerHTML = "<p>No se encontró la película seleccionada.</p>";
            return;
        }

        const sesiones = peliculaSeleccionada.sesiones[cineSeleccionado]?.[day];
        if (!sesiones || sesiones.length === 0) {
            console.log("No hay sesiones disponibles para este día.");
            showtimesContainer.innerHTML = "<p>No hay sesiones disponibles para este día.</p>";
            return;
        }

        sesiones.forEach(sesion => {
            const sessionDiv = document.createElement("div");
            sessionDiv.classList.add("session");

            const timeDiv = document.createElement("div");
            timeDiv.classList.add("session__time");
            timeDiv.textContent = sesion.hora;

            const roomDiv = document.createElement("div");
            roomDiv.classList.add("session__room");
            roomDiv.textContent = `Sala ${sesion.sala}`;

            const tagsDiv = document.createElement("div");
            tagsDiv.classList.add("session__tags");

            if (sesion.esVOSE) {
                const voseTag = document.createElement("div");
                voseTag.classList.add("session__tag", "session__tag--vose");
                voseTag.textContent = "VOSE";
                tagsDiv.appendChild(voseTag);
            }

            if (sesion.esISense) {
                const isenseTag = document.createElement("div");
                isenseTag.classList.add("session__tag", "session__tag--isense");
                isenseTag.textContent = "iSense";
                tagsDiv.appendChild(isenseTag);
            }

            sessionDiv.appendChild(timeDiv);
            sessionDiv.appendChild(roomDiv);
            sessionDiv.appendChild(tagsDiv);

            sessionDiv.addEventListener("click", () => {
                redirectToSeatSelection(
                    peliculaSeleccionada.titulo,
                    cineSeleccionado,
                    day,
                    sesion.hora,
                    sesion.sala
                );
            });

            showtimesContainer.appendChild(sessionDiv);
        });
    } catch (error) {
        console.error("Error al renderizar sesiones:", error);
        showtimesContainer.innerHTML = "<p>Error al cargar las sesiones. Intenta de nuevo más tarde.</p>";
    }
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { weekday: 'short', day: 'numeric', month: 'short' });
}

// Redirigir a la selección de asientos
function redirectToSeatSelection(movieTitle, cineName, date, time, room) {
    const queryParams = new URLSearchParams({
        cineName,
        movieTitle,
        date,
        time,
        room
    });
    window.location.href = `/cine_web_app/front-end/views/butacas.html?${queryParams.toString()}`;
}

// Cargar detalles de la película si hay un `movieId`
if (movieId) loadMovieDetails(movieId);

// Cargar cines desde la URL si hay un `cineId`
if (cineId) fetchCinemaName(cineId);
else {
    console.warn("No se detectó cineId. Esperando selección de cine.");
    showtimesContainer.innerHTML = "<p>Por favor, selecciona un cine para ver las sesiones disponibles.</p>";
}