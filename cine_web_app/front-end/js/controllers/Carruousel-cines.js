// document.addEventListener("DOMContentLoaded", () => {
//     const daySelector = document.getElementById("day-selector");
//     const prevButton = document.querySelector(".carousel__prev");
//     const nextButton = document.querySelector(".carousel__next");
//     let currentIndex = 0; // Índice de la película seleccionada

//     // Obtener el parámetro `cineId` desde la URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const cineId = urlParams.get("cineId");

//     if (!cineId) {
//         console.error("El parámetro 'cineId' no se encuentra en la URL.");
//         document.querySelector(".cine-detail__info-title").textContent = "Cine no encontrado";
//         return;
//     }

//     async function fetchMovies() {
//         try {
//             const response = await fetch(`http://localhost:5006/api/Cine/GetCineConPeliculas?cineId=${cineId}`);
//             if (!response.ok) throw new Error("Error al obtener detalles del cine");
//             const cineData = await response.json();
    
//             if (!cineData || !cineData.peliculas || cineData.peliculas.length === 0) {
//                 console.error("No se encontraron películas disponibles para este cine.");
//                 document.querySelector(".cine-detail__info-title").textContent = "No hay películas disponibles";
//                 return;
//             }
    
//             renderMovieDetails(cineData.peliculas[0]); // Muestra la primera película inicialmente
//             setupCarousel(cineData.peliculas);
//         } catch (error) {
//             console.error("Error al cargar las películas del cine:", error);
//             document.querySelector(".cine-detail__info-title").textContent = "Error al cargar las películas";
//         }
//     }
    

//     function renderMovieDetails(movie) {
//         document.querySelector(".cine-detail__info-title").textContent = movie.titulo;
//         document.querySelector(".cine-detail__info-metadata").innerHTML = `
//             <span>IMDB ${movie.calificacion}</span> | <span>${movie.fechaEstreno.slice(0, 10)}</span> | <span>${movie.duracion}</span> | <span>${movie.genero}</span>
//         `;
//         document.querySelector(".cine-detail__info-description").textContent = movie.descripcion;

//         const background = document.querySelector(".cine-detail__background");
//         background.style.backgroundImage = `url(${movie.imagen})`;
//         background.style.opacity = '1';

//         renderDayButtons(movie.sesiones);
//     }

//     function renderDayButtons(sessions) {
//         daySelector.innerHTML = "";

//         // Validar si sessions es un objeto válido
//         if (typeof sessions !== "object" || sessions === null) {
//             console.error("La estructura de sesiones no es válida:", sessions);
//             return;
//         }

//         const days = Object.keys(sessions);

//         if (days.length === 0) {
//             console.error("No hay días configurados en las sesiones:", sessions);
//             daySelector.innerHTML = "<p>No hay días disponibles para esta película.</p>";
//             return;
//         }

//         days.forEach((day, index) => {
//             const dayButton = document.createElement("button");
//             dayButton.classList.add("day-button");
//             if (index === 0) dayButton.classList.add("active"); // Marca el primer día como activo
//             dayButton.textContent = formatDate(day);
//             dayButton.dataset.date = day;

//             dayButton.addEventListener("click", () => {
//                 document.querySelectorAll(".day-button").forEach(btn => btn.classList.remove("active"));
//                 dayButton.classList.add("active");
//                 renderShowtimes(sessions, day);
//             });

//             daySelector.appendChild(dayButton);
//         });

//         renderShowtimes(sessions, days[0]);
//     }

//     function formatDate(dateString) {
//         const options = { weekday: 'short', day: 'numeric', month: 'short' };
//         return new Date(dateString).toLocaleDateString("es-ES", options);
//     }

//     function renderShowtimes(sessions, date) {
//         const showtimesContainer = document.getElementById("showtimes-container");
//         showtimesContainer.innerHTML = "";
    
//         const selectedDateSessions = sessions[date];
    
//         if (Array.isArray(selectedDateSessions)) {
//             selectedDateSessions.forEach((session) => {
//                 const sessionDiv = document.createElement("div");
//                 sessionDiv.classList.add("session");
    
//                 const timeDiv = document.createElement("div");
//                 timeDiv.classList.add("session__time");
//                 timeDiv.textContent = session.hora;
    
//                 const roomDiv = document.createElement("div");
//                 roomDiv.classList.add("session__room");
//                 roomDiv.textContent = `Sala ${session.sala} ${session.esISense ? "iSense" : ""}`;
    
//                 sessionDiv.appendChild(timeDiv);
//                 sessionDiv.appendChild(roomDiv);
    
//                 if (session.esVOSE) {
//                     const voseDiv = document.createElement("div");
//                     voseDiv.classList.add("session__tag", "session__tag--vose");
//                     voseDiv.textContent = "VOSE";
//                     sessionDiv.appendChild(voseDiv);
//                 }
    
//                 if (session.esISense) {
//                     const isenseTag = document.createElement("div");
//                     isenseTag.classList.add("session__tag", "session__tag--isense");
//                     isenseTag.textContent = "iSense";
//                     sessionDiv.appendChild(isenseTag);
//                 }
    
//                 showtimesContainer.appendChild(sessionDiv);
//             });
//         } else {
//             showtimesContainer.innerHTML = `<p>No hay sesiones disponibles para la fecha ${date}.</p>`;
//             console.error(`Sesiones no disponibles o no son un arreglo para la fecha ${date}:`, selectedDateSessions);
//         }
//     }
    

//     function setupCarousel(peliculas) {
//         const track = document.getElementById("carousel-track");
//         track.innerHTML = ""; // Limpia el carrusel

//         peliculas.forEach((movie, index) => {
//             const slide = document.createElement("li");
//             slide.classList.add("carousel__slide");
//             if (index === 0) slide.classList.add("selected");

//             const img = document.createElement("img");
//             img.src = movie.cartel;
//             img.alt = movie.titulo;
//             img.classList.add("carousel__image");

//             img.addEventListener("click", () => {
//                 updateSelectedSlide(index);
//                 renderMovieDetails(movie);
//             });

//             slide.appendChild(img);
//             track.appendChild(slide);
//         });

//         prevButton.addEventListener("click", () => {
//             if (currentIndex > 0) {
//                 updateSelectedSlide(currentIndex - 1);
//                 renderMovieDetails(peliculas[currentIndex]);
//             }
//         });

//         nextButton.addEventListener("click", () => {
//             if (currentIndex < peliculas.length - 1) {
//                 updateSelectedSlide(currentIndex + 1);
//                 renderMovieDetails(peliculas[currentIndex]);
//             }
//         });
//     }

//     function updateSelectedSlide(index) {
//         const slides = document.querySelectorAll(".carousel__slide");
//         slides.forEach(slide => slide.classList.remove("selected"));
//         slides[index].classList.add("selected");
//         currentIndex = index;
//     }

//     fetchMovies();
// });
