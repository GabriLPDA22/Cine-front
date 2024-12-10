// Aplicar ajustes al cargar la página (sino no pilla el js)
document.addEventListener('DOMContentLoaded', () => {
    cargarElementos();
});

function cargarElementos() {
const responsiveHamburger = document.querySelector('.header--responsive .header__hamburger');
const responsiveHeader = document.querySelector('.header--responsive');
const body = document.body;

responsiveHamburger.addEventListener('click', function () {
    responsiveHeader.classList.toggle('is-open');
    body.classList.toggle('menu-open'); // Evita el scroll cuando el menú está abierto
});

}
