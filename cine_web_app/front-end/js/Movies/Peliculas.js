// Obtener el ID de la película y el cine desde la URL
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

// Función para formatear fechas en formato dd/mm/yyyy
function formatDate(dateString) {
    const date = new Date(dateString);
    // Manejar fechas inválidas
    if (isNaN(date)) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

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

        // Formatear la fecha de estreno a dd/mm/yyyy
        document.getElementById('movie-release-date').textContent = formatDate(movie.fechaEstreno);

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
        if (!response.ok) throw new Error("Error al obtener el cine");

        const cine = await response.json();
        console.log("Cine encontrado:", cine);

        // Actualizar la UI con el nombre del cine
        const locationSpan = document.querySelector(".location span");
        if (locationSpan) locationSpan.textContent = cine.nombre;

        // Guardar el nombre del cine seleccionado
        cineSeleccionado = cine.nombre;

        // Determinar si estamos en desktop o móvil
        const isDesktop = window.innerWidth >= 768;

        // Mostrar elementos relacionados con sesiones
        if (daySelector) {
            daySelector.style.display = isDesktop ? "flex" : "grid";
            if (isDesktop) {
                daySelector.style.flexDirection = "row";
                daySelector.style.justifyContent = "space-between";
                daySelector.style.alignItems = "center";
            } else {
                daySelector.style.gridTemplateColumns = "repeat(2, 1fr)";
                daySelector.style.gap = "1rem";
            }
        }

        if (showtimesContainer) {
            showtimesContainer.style.display = isDesktop ? "flex" : "grid";
            if (isDesktop) {
                showtimesContainer.style.flexWrap = "wrap";
                showtimesContainer.style.justifyContent = "space-around";
            } else {
                showtimesContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
                showtimesContainer.style.gap = "1rem";
            }
        }

        // Cargar los días y las sesiones del cine seleccionado
        await loadDaysAndSessions(cine.id);
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

        // Determinar si estamos en desktop o mobile
        const isDesktop = window.innerWidth >= 768; // Puedes ajustar este breakpoint

        // Mostrar los elementos de día y sesiones con el layout adecuado
        if (daySelector) {
            daySelector.style.display = isDesktop ? "flex" : "grid"; // Flex para desktop, grid para móvil
            if (isDesktop) {
                daySelector.style.flexDirection = "row"; // Aseguramos que sea fila en desktop
                daySelector.style.justifyContent = "space-between";
                daySelector.style.alignItems = "center";
            } else {
                daySelector.style.gridTemplateColumns = "repeat(2, 1fr)"; // Para móvil
                daySelector.style.gap = "1rem";
            }
        }

        if (showtimesContainer) {
            showtimesContainer.style.display = isDesktop ? "flex" : "grid"; // Flex para desktop, grid para móvil
            if (isDesktop) {
                showtimesContainer.style.flexWrap = "wrap"; // Ajustamos para que las sesiones se distribuyan
                showtimesContainer.style.justifyContent = "space-around";
            } else {
                showtimesContainer.style.gridTemplateColumns = "repeat(2, 1fr)"; // Para móvil
                showtimesContainer.style.gap = "1rem";
            }
        }

        // Cargar los días y las sesiones del cine seleccionado
        await loadDaysAndSessions(cinemaId);
    } catch (error) {
        console.error("Error al seleccionar el cine:", error);
    }
}

// Abre el modal de filtro
function openFilterModal() {
    document.getElementById("filter-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

// Cierra el modal de filtro
function closeFilterModal() {
    document.getElementById("filter-modal").classList.add("hidden");
    document.body.style.overflow = "auto";
    updateFilterText();
}

// Actualiza el texto del botón "Filtrar por" según las opciones seleccionadas
function updateFilterText() {
    const isenseChecked = document.getElementById("filter-isense").checked;
    const voseChecked = document.getElementById("filter-vose").checked;
    const normalesChecked = document.getElementById("filter-normales").checked;

    let filterText = "Filtrar por";

    if (isenseChecked || voseChecked || normalesChecked) {
        filterText = "";
        if (isenseChecked) filterText += " ISense";
        if (voseChecked) filterText += (filterText ? " + " : "") + "VOSE";
        if (normalesChecked) filterText += (filterText ? " + " : "") + "Normales";
    }

    document.querySelector(".filter span").textContent = filterText.trim();
}

// Aplica los filtros seleccionados
function applyFilters() {
    const isenseChecked = document.getElementById("filter-isense").checked;
    const voseChecked = document.getElementById("filter-vose").checked;
    const normalesChecked = document.getElementById("filter-normales").checked;

    // Obtén todas las sesiones visibles actualmente
    const sessions = document.querySelectorAll(".session");

    sessions.forEach((session) => {
        // Verifica las etiquetas (tags) dentro de la sesión
        const hasISense = session.querySelector(".session__tag--isense") !== null;
        const hasVOSE = session.querySelector(".session__tag--vose") !== null;
        const isNormal = !hasISense && !hasVOSE;

        // Decide si mostrar u ocultar la sesión
        if (
            (isenseChecked && hasISense) ||
            (voseChecked && hasVOSE) ||
            (normalesChecked && isNormal)
        ) {
            session.style.display = "flex"; // Mostrar si cumple el filtro
        } else {
            session.style.display = "none"; // Ocultar si no cumple
        }
    });

    // Actualiza el texto del botón "Filtrar por"
    updateFilterText();
}

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

        // Recolectar fechas únicas de las sesiones
        cine.peliculas.forEach(pelicula => {
            const sesionesPorCine = pelicula.sesiones[cineSeleccionado];
            if (!sesionesPorCine) return;

            Object.keys(sesionesPorCine).forEach(day => {
                fechasUnicas.add(day); // Agregar la fecha
            });
        });

        // Convertir a un array y ordenar cronológicamente
        const fechasArray = Array.from(fechasUnicas)
            .map(day => new Date(day)) // Convertir a objetos Date
            .sort((a, b) => a - b); // Ordenar fechas cronológicamente

        if (fechasArray.length === 0) {
            console.warn("No hay sesiones disponibles.");
            showtimesContainer.innerHTML = "<p>No hay sesiones disponibles para este cine.</p>";
            return;
        }

        // Fecha mínima del rango de sesiones
        const firstSessionDate = fechasArray[0]; // Fecha de la primera sesión disponible
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Limpiar la hora para comparaciones

        const MAX_DIAS_PASADOS = 2; // Máximo de días pasados permitidos
        const diasAMostrar = []; // Array para los días que se mostrarán

        // Agregar hasta 2 días pasados antes de la primera sesión,
        // siempre que estén dentro del mismo mes y año
        for (let i = 1; i <= MAX_DIAS_PASADOS; i++) {
            const diaPasado = new Date(firstSessionDate);
            diaPasado.setDate(diaPasado.getDate() - i); // Restar días
            if (
                diaPasado.getMonth() !== firstSessionDate.getMonth() || // Mismo mes
                diaPasado.getFullYear() !== firstSessionDate.getFullYear() // Mismo año
            ) {
                break; // No agregar días fuera del mismo mes y año
            }
            diasAMostrar.push(diaPasado);
        }

        // Agregar las fechas de las sesiones futuras (incluyendo hoy)
        fechasArray.forEach(fecha => {
            if (fecha >= today) {
                diasAMostrar.push(fecha);
            }
        });

        // Renderizar los botones de días en el selector
        diasAMostrar.sort((a, b) => a - b).forEach((date, index) => {
            const dayButton = document.createElement("button");
            dayButton.classList.add("day-button");
            dayButton.textContent = formatDate(date); // Formatear fecha para el botón
            dayButton.dataset.date = date.toISOString().split('T')[0]; // yyyy-mm-dd

            // Estilizar días pasados como deshabilitados
            if (date < today) {
                dayButton.disabled = true;
                dayButton.classList.add("day-button--disabled");
                dayButton.setAttribute("aria-disabled", "true");
            } else {
                // Añadir funcionalidad para días habilitados
                dayButton.addEventListener("click", () => {
                    document.querySelectorAll(".day-button").forEach(btn => btn.classList.remove("active"));
                    dayButton.classList.add("active");
                    diaSeleccionado = dayButton.dataset.date; // Actualizar día seleccionado

                    renderShowtimesByDate(dayButton.dataset.date, cineId);
                });

                // Seleccionar automáticamente el primer día habilitado
                if (index === 0 && date >= today) {
                    dayButton.classList.add("active");
                    diaSeleccionado = dayButton.dataset.date;
                    renderShowtimesByDate(dayButton.dataset.date, cineId);
                }
            }

            daySelector.appendChild(dayButton);
        });

        // Mostrar el selector de días solo si hay días disponibles
        if (diasAMostrar.length > 0) {
            daySelector.style.display = "flex";
        } else {
            daySelector.style.display = "none";
            showtimesContainer.innerHTML = "<p>No hay sesiones disponibles para este cine.</p>";
        }
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

        // Filtrar sesiones que ya han pasado si el día es hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isToday = new Date(day).toDateString() === today.toDateString();
        const now = new Date();

        sesiones.forEach(sesion => {
            // Crear contenedor de sesión
            const sessionDiv = document.createElement("div");
            sessionDiv.classList.add("session");

            // Mostrar hora
            const timeDiv = document.createElement("div");
            timeDiv.classList.add("session__time");
            timeDiv.textContent = sesion.hora;
            sessionDiv.appendChild(timeDiv);

            // Mostrar sala
            const roomDiv = document.createElement("div");
            roomDiv.classList.add("session__room");
            roomDiv.textContent = `Sala ${sesion.sala}`;
            sessionDiv.appendChild(roomDiv);

            // Mostrar tags
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

            sessionDiv.appendChild(tagsDiv);

            // Determinar si la sesión está en el pasado
            let sessionInPast = false;
            if (isToday) {
                const sessionDateTime = new Date(`${day}T${sesion.hora}`);
                if (sessionDateTime < now) {
                    sessionInPast = true;
                }
            } else if (new Date(day) < today) {
                sessionInPast = true;
            }

            // Aplicar estilos y comportamiento si la sesión está en el pasado
            if (sessionInPast) {
                sessionDiv.classList.add("session--past");
                sessionDiv.style.opacity = "0.5";
                sessionDiv.style.cursor = "not-allowed";
            } else {
                sessionDiv.addEventListener("click", () => {
                    redirectToSeatSelection(
                        peliculaSeleccionada.titulo,
                        cineSeleccionado,
                        day,
                        sesion.hora,
                        sesion.sala,
                        sesion.id // Pasar el ID de la sesión
                    );
                });
            }

            showtimesContainer.appendChild(sessionDiv);
        });
    } catch (error) {
        console.error("Error al renderizar sesiones:", error);
        showtimesContainer.innerHTML = "<p>Error al cargar las sesiones. Intenta de nuevo más tarde.</p>";
    }
}

// Redirigir a la selección de asientos
function redirectToSeatSelection(movieTitle, cineName, date, time, room, sesionId) {
    const queryParams = new URLSearchParams({
        cineName,
        movieTitle,
        date,
        time,
        room,
        sesionId // Asegúrate de incluir el sesionId aquí
    });
    window.location.href = `/cine_web_app/front-end/views/Butacas.html?${queryParams.toString()}`;
}

// Función de redirección de ejemplo
// function redirectToSeatSelection(titulo, cine, dia, hora, sala, sesionId) {
//     window.location.href = `/seleccionar-asientos?titulo=${encodeURIComponent(titulo)}&cine=${encodeURIComponent(cine)}&dia=${dia}&hora=${hora}&sala=${sala}&sesionId=${sesionId}`;
// }

// Cargar detalles de la película si hay un `movieId`
if (movieId) loadMovieDetails(movieId);

// Cargar cines desde la URL si hay un `cineId`
if (cineId) fetchCinemaName(cineId);
else {
    console.warn("No se detectó cineId. Esperando selección de cine.");
    showtimesContainer.innerHTML = "<p>Por favor, selecciona un cine para ver las sesiones disponibles.</p>";
}
