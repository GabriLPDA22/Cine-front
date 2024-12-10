document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);

    // Información de la película
    const movieTitleElement = document.querySelector('.movie-title__text');
    const sessionDetailsElement = document.querySelector('.session-details');
    const bannerImageElement = document.querySelector('.movie-details__background-image');
    const totalDisplay = document.getElementById('total-value');

    // Inicializar totales
    let ticketTotal = parseFloat(params.get('totalPrice')) || 0; // Precio de las entradas
    let cartTotal = ticketTotal; // Precio total del carrito (entradas + productos)
    const cartItems = {}; // Objeto para almacenar los productos seleccionados

    // Función para actualizar el total visual
    const updateTotalDisplay = () => {
        if (totalDisplay) {
            totalDisplay.textContent = `${cartTotal.toFixed(2)} €`;
        }
    };

    // Inicializar la visualización del total
    updateTotalDisplay();

    // Renderizar información de la película
    if (movieTitleElement) {
        movieTitleElement.textContent = params.get('movieTitle') || "SIN TÍTULO";
    }

    if (sessionDetailsElement) {
        sessionDetailsElement.innerHTML = `
            <p>CINE: ${params.get('cineName') || "Sin cine"}</p>
            <p>SESIÓN: ${params.get('date') || "Fecha no disponible"}, ${params.get('time') || "Hora no disponible"}</p>
        `;
    }

    if (bannerImageElement) {
        const bannerImage = params.get('bannerImage');
        if (bannerImage) {
            bannerImageElement.src = bannerImage;
        }
    }

    const productsContainer = document.querySelector('.products-bar__items');
    const categoriesContainer = document.querySelector('.products-bar__categories ul');

    // Función para cargar productos por categoría
    const loadProducts = async (category = "") => {
        try {
            const response = await fetch(`http://localhost:5006/api/Productos/GetProductos?categoria=${encodeURIComponent(category)}`);
            if (!response.ok) throw new Error("Error al cargar productos del bar.");

            const products = await response.json();
            if (!productsContainer) {
                console.error("Contenedor de productos no encontrado.");
                return;
            }

            productsContainer.innerHTML = ""; // Limpia productos previos

            if (products.length === 0) {
                productsContainer.innerHTML = `
                    <p class="no-products-message">No hay productos disponibles en esta categoría.</p>
                `;
                return;
            }

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card__button';
                productCard.innerHTML = `
                    <div class="product-card__image-container">
                        <img src="${product.imagenUrl}" alt="${product.nombre}" class="product-card__image">
                    </div>
                    <div class="product-card__details">
                        <span class="product-card__name">${product.nombre}</span>
                        <span class="product-card__price">${product.precio.toFixed(2)} €</span>
                        <div class="product-card__quantity">
                            <button class="product-card__add-button" data-id="${product.id}" data-name="${product.nombre}" data-price="${product.precio}" data-action="decrease">-</button>
                            <span class="quantity-display" data-id="${product.id}">x0</span>
                            <button class="product-card__add-button" data-id="${product.id}" data-name="${product.nombre}" data-price="${product.precio}" data-action="increase">+</button>
                        </div>
                    </div>
                    <p class="product-card__description">Consulta los alérgenos en nuestra web o pregunta al personal.</p>
                `;
                productsContainer.appendChild(productCard);
            });

            // Añadir eventos a los botones "Añadir" y "Quitar"
            const addButtons = document.querySelectorAll('.product-card__add-button');
            addButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.dataset.id;
                    const productName = button.dataset.name;
                    const productPrice = parseFloat(button.dataset.price);
                    const action = button.dataset.action;
                    const quantityDisplay = document.querySelector(`.quantity-display[data-id="${productId}"]`);

                    // Inicializar producto en el carrito si no existe
                    if (!cartItems[productId]) {
                        cartItems[productId] = { id: productId, name: productName, price: productPrice, quantity: 0 };
                    }

                    // Incrementar o decrementar la cantidad
                    if (action === "increase") {
                        cartItems[productId].quantity++;
                        cartTotal += productPrice;
                    } else if (action === "decrease" && cartItems[productId].quantity > 0) {
                        cartItems[productId].quantity--;
                        cartTotal -= productPrice;
                    }

                    // Evitar cantidades negativas
                    if (cartItems[productId].quantity < 0) {
                        cartItems[productId].quantity = 0;
                    }

                    // Actualizar visualización de la cantidad
                    if (quantityDisplay) {
                        quantityDisplay.textContent = `x${cartItems[productId].quantity}`;
                    }

                    // Actualizar el total visual
                    updateTotalDisplay();
                });
            });
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    // Función para cargar categorías
    const loadCategories = async () => {
        try {
            const response = await fetch("http://localhost:5006/api/Productos/GetCategorias");
            if (!response.ok) throw new Error("Error al cargar categorías.");

            const categories = await response.json();
            if (!categoriesContainer) {
                console.error("Contenedor de categorías no encontrado.");
                return;
            }

            categoriesContainer.innerHTML = ""; // Limpia categorías previas

            categories.forEach(category => {
                const categoryItem = document.createElement("li");
                const categoryLink = document.createElement("a");
                categoryLink.textContent = category;
                categoryLink.href = "#";
                categoryLink.className = "category-link";
                categoryLink.dataset.category = category;

                // Al hacer clic en una categoría, cargar productos de esa categoría
                categoryLink.addEventListener("click", async (e) => {
                    e.preventDefault();
                    await loadProducts(category); // Filtrar por categoría seleccionada
                    document.querySelectorAll(".category-link").forEach(link => link.classList.remove("active"));
                    categoryLink.classList.add("active");
                });

                categoryItem.appendChild(categoryLink);
                categoriesContainer.appendChild(categoryItem);
            });

            // Cargar productos de la primera categoría por defecto
            if (categories.length > 0) {
                const firstCategoryLink = categoriesContainer.querySelector('.category-link');
                if (firstCategoryLink) {
                    firstCategoryLink.classList.add('active');
                    await loadProducts(categories[0]);
                }
            }
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    };


    // Cargar categorías y productos iniciales
    await loadCategories();

    // Modal Logic
    const allergiesButton = document.getElementById("allergies-button");
    const modal = document.getElementById("modal");
    const modalClose = document.getElementById("modal-close");

    if (allergiesButton && modal && modalClose) {
        // Función para abrir el modal
        const openModal = () => {
            modal.classList.add("visible");
            document.body.style.overflow = "hidden"; // Evita el scroll en el fondo
        };

        // Función para cerrar el modal
        const closeModal = () => {
            modal.classList.remove("visible");
            document.body.style.overflow = "auto"; // Restaura el scroll
        };

        // Evento para abrir el modal al hacer clic en el botón
        allergiesButton.addEventListener("click", openModal);

        // Evento para cerrar el modal al hacer clic en el botón de cerrar
        modalClose.addEventListener("click", closeModal);

        // Cerrar el modal al hacer clic fuera del contenido
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    } else {
        console.warn("No se encontraron elementos para el modal.");
    }

// Botón "Continuar"
const continueButton = document.getElementById("continue-btn");
if (continueButton) {
    continueButton.addEventListener("click", () => {
        // Filtrar los productos con cantidad > 0
        const selectedProducts = Object.values(cartItems).filter(product => product.quantity > 0);

        // Crear un string con las id y cantidades
        const productsParam = selectedProducts.map(product => {
            return `id=${product.id}&quantity=${product.quantity}`;
        }).join('&'); // Une con '&' para formar el formato de la URL

        // Añadir al objeto de parámetros
        params.set('products', productsParam);
        params.set('cartTotal', cartTotal.toFixed(2)); // También almacena el total del carrito

        // Redirigir a la página de compra con los nuevos parámetros
        window.location.href = `/cine_web_app/front-end/views/Compra/CompraInvitado.html?${params.toString()}`;
    });
}

});
