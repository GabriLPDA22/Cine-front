// Obtener los parámetros de la URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const movieTitle = params.get('movieTitle');
    const cinemaName = params.get('cineName');
    const date = params.get('date');
    const time = params.get('time');
    const room = params.get('room');
    
    console.log('Parámetros extraídos:', { movieTitle, cinemaName, date, time, room });

    if (!movieTitle || !cinemaName || !date || !time || !room) {
        console.error("Algunos parámetros están vacíos o son nulos:", { movieTitle, cinemaName, date, time, room });
    }

    return { movieTitle, cinemaName, date, time, room };
}

// Función para cargar la información de la sesión en la página
async function loadGuestPurchaseInfo() {
    const { movieTitle, cinemaName, date, time, room } = getQueryParams();

    if (!movieTitle || !cinemaName || !date || !time || !room) {
        console.error("Faltan parámetros en la URL para cargar la información.");
        document.querySelector('.movie-title__text').textContent = "Error al cargar datos";
        document.querySelector('.session-details').textContent = "Por favor, verifica los parámetros de la URL.";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5006/api/Cine/GetSeatSelectionInfo?cineName=${encodeURIComponent(cinemaName)}&movieTitle=${encodeURIComponent(movieTitle)}&sessionDate=${encodeURIComponent(date)}&sessionTime=${encodeURIComponent(time)}`);
        
        if (!response.ok) {
            throw new Error("Error al obtener la información de la sesión.");
        }

        const data = await response.json();
        console.log("Datos recibidos del backend:", data);

        // Actualizar el título de la película
        document.querySelector('.movie-title__text').textContent = data.movieTitle || "SIN TÍTULO";

        // Actualizar los detalles de la sesión
        document.querySelector('.session-details').innerHTML = `
            <p>CINE: ${data.cineName || "Sin nombre de cine"}</p>
            <p>SESIÓN: ${data.sessionDate || "Fecha no disponible"}, ${data.sessionTime || "Hora no disponible"}</p>
            <p>SALA: ${data.room || "Sala no disponible"}</p>
        `;

        // Actualizar la imagen del banner
        const bannerImageElement = document.querySelector('.movie-details__background-image');
        if (bannerImageElement) {
            bannerImageElement.src = data.bannerImage || '/cine_web_app/front-end/images/default-banner.jpg'; // Imagen por defecto
            bannerImageElement.alt = `Banner de ${data.movieTitle || "la película"}`;
        }

    } catch (error) {
        console.error("Error al cargar la información de la película:", error);
        document.querySelector('.movie-title__text').textContent = "Error al cargar la información de la película.";
        document.querySelector('.session-details').innerHTML = `
            <p>Por favor, intenta nuevamente más tarde.</p>
        `;
    }
}

// Llamar a la función al cargar la página
window.onload = loadGuestPurchaseInfo;
