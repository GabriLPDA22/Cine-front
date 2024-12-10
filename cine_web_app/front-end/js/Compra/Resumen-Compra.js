// Función para formatear fechas al estilo dd/MM/yyyy
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
}

// Función para rellenar los datos en el HTML
function populateSummary() {
    const params = getQueryParams();

    // Rellenar el título de la película y formatear correctamente
    const movieTitleElement = document.querySelector('.purchase-summary__title');
    if (movieTitleElement) {
        movieTitleElement.textContent = (params.movieTitle || 'Título no disponible').replace(/\+/g, ' ');
    }

    // Rellenar la información general
    const cineElement = document.querySelector('.purchase-summary__info-item:nth-child(1)');
    const dateElement = document.querySelector('.purchase-summary__info-item:nth-child(2)');
    const timeElement = document.querySelector('.purchase-summary__info-item:nth-child(3)');
    const roomElement = document.querySelector('.purchase-summary__info-item:nth-child(4)');
    const seatsElement = document.querySelector('.purchase-summary__info-item:nth-child(5)');
    const totalElement = document.querySelector('.purchase-summary__info-item:nth-child(6)');

    if (cineElement) cineElement.innerHTML = `<strong>Cine:</strong> ${params.cineName || 'No disponible'}`;
    if (dateElement) {
        const formattedDate = params.date ? formatDate(params.date) : 'No disponible';
        dateElement.innerHTML = `<strong>Fecha:</strong> ${formattedDate}`;
    }
    if (timeElement) timeElement.innerHTML = `<strong>Hora:</strong> ${params.time || 'No disponible'}`;
    if (roomElement) roomElement.innerHTML = `<strong>Sala:</strong> ${params.room || 'No disponible'}`;
    if (seatsElement) seatsElement.innerHTML = `<strong>Entradas:</strong> ${params.seats || 'No disponible'}`;
    if (totalElement) totalElement.innerHTML = `<strong>Precio Total:</strong> ${params.cartTotal || '0,00 €'} <a>€</a>`;

    // Datos personales
    const nameElement = document.querySelector('.purchase-summary__info-item--personal:nth-child(1)');
    const emailElement = document.querySelector('.purchase-summary__info-item--personal:nth-child(2)');
    const phoneElement = document.querySelector('.purchase-summary__info-item--personal:nth-child(3)');

    if (nameElement) nameElement.textContent = `${params.name || 'No disponible'} ${params.surname || ''}`;
    if (emailElement) emailElement.textContent = params.email || 'No disponible';
    if (phoneElement) phoneElement.textContent = params.phone || 'No disponible';

    // Procesar productos del carrito
    const productParam = params.products;
    if (productParam) {
        const productIds = extractProductIds(productParam);
        if (productIds.length > 0) {
            fetchProductData(productIds);
        }
    }

    // Llamar a la función para obtener datos de la API y cargar la imagen
    const movieTitle = params.movieTitle || '';
    if (movieTitle) {
        fetchMovieData(movieTitle.replace(/\+/g, ' '));
    }
}

// Función para extraer IDs de productos del parámetro 'products'
function extractProductIds(productParam) {
    const productMatches = productParam ? productParam.match(/id=(\d+)/g) : [];
    return productMatches.map(match => parseInt(match.split('=')[1], 10));
}

// Función para obtener los parámetros de la URL
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.slice(1);
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
    });
    console.log(params); // Añadir esto para verificar los parámetros extraídos
    return params;
}

// Función para cargar los datos de la película desde la API
function fetchMovieData(movieTitle) {
    const apiUrl = 'http://localhost:5006/api/Movie/GetPeliculas';

    console.log(`Llamando a la API de películas en: ${apiUrl}`);

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos de la API de películas');
            }
            return response.json();
        })
        .then(data => {
            const movie = data.find(movie => movie.titulo.toLowerCase() === movieTitle.toLowerCase());
            if (movie) {
                const movieImageElement = document.querySelector('.purchase-summary__movie-image');
                if (movieImageElement) {
                    movieImageElement.src = movie.cartel;
                    movieImageElement.alt = movie.titulo;
                }
            } else {
                console.warn('Película no encontrada en la API');
            }
        })
        .catch(error => {
            console.error('Error al cargar los datos de la API de películas:', error);
        });
}

// Función para cargar los datos del producto desde la API
function fetchProductData(productIds) {
    const apiUrl = `http://localhost:5006/api/Productos/GetProductos?ids=${productIds.join(',')}`;

    console.log(`Llamando a la API de productos en: ${apiUrl}`);

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos de la API de productos');
            }
            return response.json();
        })
        .then(data => {
            const productContainer = document.querySelector('.purchase-summary__product-list');
            if (productContainer) {
                productContainer.innerHTML = ''; // Limpiar cualquier contenido previo
                productIds.forEach(productId => {
                    const product = data.find(product => product.id === productId);
                    if (product) {
                        const productElement = document.createElement('p');
                        productElement.innerHTML = `${product.nombre} - ${product.precio}€`;
                        productContainer.appendChild(productElement);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar los datos de la API de productos:', error);
        });
}
async function createOrder() {
    const params = getQueryParams();

    const sesionId = parseInt(params.sesionId, 10);
    if (isNaN(sesionId) || sesionId <= 0) {
        alert("El ID de sesión no es válido.");
        return;
    }

    const normalCount = parseInt(params.normalCount, 10) || 0;
    const vipCount = parseInt(params.vipCount, 10) || 0;

    const productParam = params.products;
    const parsedProducts = parseProducts(productParam);

    let products = [];
    if (parsedProducts.length > 0) {
        const productIds = parsedProducts.map(p => p.id);
        products = await fetchProductDetails(productIds);
    }

    const pedidoData = {
        nombreCliente: params.name || 'No disponible',
        emailCliente: params.email || 'No disponible',
        telefonoCliente: params.phone || 'No disponible',
        tituloPelicula: params.movieTitle || 'Título no disponible',
        cine: params.cineName || 'No disponible',
        fecha: params.date || 'No disponible',
        hora: params.time || 'No disponible',
        sala: params.room || 'No disponible',
        butacasReservadas: params.seats ? params.seats.split(',') : [],
        totalPago: parseFloat(params.cartTotal) || 0,
        entradas: [
            { tipo: 'Normal', cantidad: normalCount, precioUnitario: 6.9, precioTotal: normalCount * 6.9 },
            { tipo: 'VIP', cantidad: vipCount, precioUnitario: 8.1, precioTotal: vipCount * 8.1 }
        ],
        productos: parsedProducts.map(p => {
            const productDetails = products.find(product => product.id === p.id);
            return {
                id: p.id,
                cantidad: p.quantity,
                nombre: productDetails ? productDetails.nombre : 'Desconocido',
                precio: productDetails ? productDetails.precio : 0
            };
        }),
        sesionId: sesionId
    };

    try {
        const response = await fetch('http://localhost:5006/api/Pedido/CreatePedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoData)
        });

        if (!response.ok) {
            throw new Error(`Error al crear el pedido: ${response.statusText}`);
        }

    } catch (error) {
        console.error('Error al crear el pedido:', error);
        alert('Hubo un error al crear el pedido. Intenta nuevamente.');
    }
}

// Función para parsear los productos desde la URL
function parseProducts(productParam) {
    const productData = [];
    if (!productParam) return productData;

    const regex = /id=(\d+)&quantity=(\d+)/g;
    let match;

    while ((match = regex.exec(productParam)) !== null) {
        productData.push({
            id: parseInt(match[1], 10),
            quantity: parseInt(match[2], 10),
        });
    }

    return productData;
}
// Nueva función para obtener detalles de productos desde la API
async function fetchProductDetails(productIds) {
    const apiUrl = `http://localhost:5006/api/Productos/GetProductos?ids=${productIds.join(',')}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Error al obtener los detalles de los productos');
        }
        return await response.json();
    } catch (error) {
        console.error('Error al cargar los detalles de los productos:', error);
        return [];
    }
}
// Llamar a la función para rellenar el resumen
populateSummary();

// Crear el pedido automáticamente cuando la página se cargue
document.addEventListener('DOMContentLoaded', createOrder);
