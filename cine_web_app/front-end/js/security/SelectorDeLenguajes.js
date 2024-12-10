document.addEventListener("DOMContentLoaded", function() {
    const languageToggle = document.getElementById("language-toggle");
    const languageDropdown = document.querySelector(".header__language-dropdown");
    const languageOption = document.querySelector(".header__language-option");
    const currentLanguageSpan = document.getElementById("current-language");

    // Inicializar el idioma actual como español
    let currentLanguage = "es";
    currentLanguageSpan.textContent = "Español"; // Mostrar "Español" por defecto
    translateContent(currentLanguage);

    // Mostrar/Ocultar el menú desplegable al hacer clic en el botón
    languageToggle.addEventListener("click", function(event) {
        event.stopPropagation(); // Evita que el clic se propague y cierre el menú automáticamente
        languageDropdown.style.display = languageDropdown.style.display === "block" ? "none" : "block";
    });

    // Cambiar el idioma al hacer clic en la opción del menú
    languageOption.addEventListener("click", function() {
        currentLanguage = currentLanguage === "en" ? "es" : "en";
        currentLanguageSpan.textContent = currentLanguage === "en" ? "English" : "Español";
        translateContent(currentLanguage);
        languageDropdown.style.display = "none"; // Cerrar el menú después de seleccionar
        updateLanguageOption(); // Actualizar la opción del menú desplegable
    });

    // Cerrar el menú desplegable si se hace clic fuera de él
    document.addEventListener("click", function(event) {
        if (!languageToggle.contains(event.target)) {
            languageDropdown.style.display = "none";
        }
    });

    // Función para traducir el contenido
    function translateContent(language) {
        // Traducir los elementos con data-en y data-es
        document.querySelectorAll("[data-en]").forEach(element => {
            element.textContent = element.getAttribute(`data-${language}`);
        });

        // Traducir específicamente el botón y el texto de "Comprar como Invitado"
        const guestButton = document.getElementById("guest-purchase-btn");
        if (guestButton) {
            guestButton.textContent = language === "en" ? "Buy as Guest" : "Comprar como Invitado";
        }

        const guestText = document.getElementById("guest-text");
        if (guestText) {
            guestText.textContent = language === "en" ? "You can continue without logging in as a guest:" : "Puedes continuar sin iniciar sesión como invitado:";
        }
    }

    // Función para actualizar la opción de idioma en el menú desplegable
    function updateLanguageOption() {
        languageOption.textContent = currentLanguage === "en" ? "Español" : "English";
        languageOption.setAttribute("data-language", currentLanguage === "en" ? "es" : "en");
    }
});
