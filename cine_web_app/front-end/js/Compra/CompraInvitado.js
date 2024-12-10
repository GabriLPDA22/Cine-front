document.addEventListener('DOMContentLoaded', async function () {
    const ticketTable = document.querySelector('.ticket-table');
    const totalSummary = document.getElementById('final-total');

    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const seats = params.get('seats') ? params.get('seats').split(',') : [];
    const totalPrice = parseFloat(params.get('totalPrice')) || 0; // Precio de las entradas
    const vipCount = parseInt(params.get('vipCount')) || 0; // Número de entradas VIP
    const productParam = params.get('products'); // Cadena de productos (IDs y cantidades)
    const cartTotal = parseFloat(params.get('cartTotal')) || 0; // Total de la compra (entradas + productos)

    // Parsear el parámetro 'products' del URL
    function parseProducts(productParam) {
        const productData = [];
        if (!productParam) return productData;

        // Usar una expresión regular para capturar múltiples "id" y "quantity"
        const regex = /id=(\d+)&quantity=(\d+)/g;
        let match;

        while ((match = regex.exec(productParam)) !== null) {
            productData.push({
                id: parseInt(match[1]), // Captura el ID del producto
                quantity: parseInt(match[2]) // Captura la cantidad del producto
            });
        }

        return productData;
    }

    const parsedProducts = parseProducts(productParam); // [{ id: 1, quantity: 1 }, { id: 2, quantity: 1 }]

    // Obtener solo las IDs para el fetch
    const productIds = parsedProducts.map(p => p.id);

    // Función para hacer fetch de los productos por sus IDs
    async function fetchProductDetails(productIds) {
        try {
            if (productIds.length === 0) {
                console.warn("No se encontraron IDs de productos en el URL.");
                return [];
            }

            // Hacer fetch de los productos desde el backend
            const url = `http://localhost:5006/api/Productos/GetProductos?ids=${productIds.join(',')}`;
            console.log("URL construida para fetch:", url);

            const response = await fetch(url);
            if (!response.ok) {
                console.error("Error en la respuesta del servidor:", response.status, response.statusText);
                throw new Error("Error al obtener los detalles de los productos.");
            }

            const products = await response.json();
            console.log("Productos obtenidos del backend:", products);

            // Filtrar los productos para que solo queden los que están en el URL
            return products.filter(product => productIds.includes(product.id));
        } catch (error) {
            console.error("Detalles del error al obtener productos:", error);
            return [];
        }
    }

    // Combinar productos con cantidades
    function combineProductsWithQuantities(products, parsedProducts) {
        return products.map(product => {
            const quantity = parsedProducts.find(p => p.id === product.id)?.quantity || 1;
            return {
                ...product,
                quantity // Asignar la cantidad correspondiente
            };
        });
    }

    // Renderizar productos con un botón para eliminar
    function renderProducts(products) {
        products.forEach(product => {
            const productRow = document.createElement('div');
            productRow.classList.add('table-row');
            productRow.setAttribute('data-product-id', product.id); // Atributo para identificar el producto

            productRow.innerHTML = `
            <span>
                <img src="${product.imagenUrl}" class="product-image">
                <div class="test">${product.quantity}x ${product.nombre}</div>
            </span>
            <span>${(product.precio * product.quantity).toFixed(2)} €</span>
            <button class="delete-product" aria-label="Eliminar producto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-trash">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-2 14H7L5 6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                </svg>
            </button>
        `;

            ticketTable.appendChild(productRow);

            // Añadir funcionalidad para eliminar productos
            productRow.querySelector('.delete-product').addEventListener('click', function () {
                removeProduct(product.id);
            });
        });
    }

    // Función para eliminar productos
    function removeProduct(productId) {
        // Filtrar el producto eliminado del array `parsedProducts`
        const updatedProducts = parsedProducts.filter(product => product.id !== productId);

        // Actualizar la lista de productos en la URL
        const updatedProductParam = updatedProducts.map(p => `id=${p.id}&quantity=${p.quantity}`).join('&');
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set('products', updatedProductParam);

        // Actualizar la página para reflejar los cambios
        const newQueryString = currentParams.toString();
        window.location.href = `?${newQueryString}`;
    }


    // Renderizar entradas normales
    function renderNormalTickets() {
        const normalCount = seats.length - vipCount; // Diferencia entre total de entradas y las VIP
        const normalPrice = normalCount * 6.90; // Precio de las entradas normales
        if (normalCount > 0) {
            const normalRow = document.createElement('div');
            normalRow.classList.add('table-row');
            normalRow.innerHTML = `
                <span>
                    <img src="/cine_web_app/front-end/images/ticket-normal.svg" alt="Entrada Normal" class="ticket-image">
                    ${normalCount}x Entrada Normal
                </span>
                <span>${normalPrice.toFixed(2)} €</span>
            `;
            ticketTable.appendChild(normalRow);
        }
    }


    // Renderizar entradas VIP
    function renderVipTickets() {
        const vipPrice = vipCount * 8.10; // Precio de las entradas VIP
        if (vipCount > 0) {
            const vipRow = document.createElement('div');
            vipRow.classList.add('table-row');
            vipRow.innerHTML = `
                <span>
                    <img src="/cine_web_app/front-end/images/ticket-vip.svg" alt="Entrada VIP" class="ticket-image">
                    ${vipCount}x Entrada VIP
                </span>
                <span>${vipPrice.toFixed(2)} €</span>
            `;
            ticketTable.appendChild(vipRow);
        }
    }

    // Mostrar el total final
    function renderTotal() {
        totalSummary.textContent = `${cartTotal.toFixed(2)} €`;
    }

    // Renderizar la página completa
    async function renderPage() {
        renderNormalTickets();
        renderVipTickets();

        // Obtener y mostrar productos desde la API
        const products = await fetchProductDetails(productIds);
        const combinedProducts = combineProductsWithQuantities(products, parsedProducts);
        renderProducts(combinedProducts);

        renderTotal(); // Muestra el total directamente desde `cartTotal`
    }

    await renderPage(); // Inicia el renderizado
});


document.getElementById('finalize-purchase').addEventListener('click', function (e) {
    const fields = document.querySelectorAll('.customer-info input');
    let isValid = true;
    let queryParams = [];

    // Validar campos del formulario
    fields.forEach(field => {
        if (field.value.trim() === '') {
            isValid = false;
            field.style.borderColor = '#ff2c78';
            field.style.boxShadow = '0 0 5px rgba(255, 44, 120, 0.5)';
        } else {
            field.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            field.style.boxShadow = 'none';
            queryParams.push(`${encodeURIComponent(field.name)}=${encodeURIComponent(field.value)}`);
        }
    });

    if (!isValid) {
        e.preventDefault();
        alert('Por favor, rellena todos los campos antes de continuar.');
    } else {
        // Agregar parámetros adicionales
        const currentParams = new URLSearchParams(window.location.search);
        queryParams.forEach(param => {
            const [key, value] = param.split('=');
            currentParams.set(key, decodeURIComponent(value));
        });

        // Redirigir a la página de resumen con todos los parámetros
        const newQueryString = currentParams.toString();
        window.location.href = `Resumen.html?${newQueryString}`;
    }
});




