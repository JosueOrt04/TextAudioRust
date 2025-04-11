document.addEventListener("DOMContentLoaded", function () {
    // Animación de la sección "Texto a voz"
    const content = document.querySelector(".content");

    setTimeout(() => {
        content.style.opacity = "1";
        content.style.transform = "translateY(0)";
    }, 500);

    // Menú desplegable Funciones
    const funcionesLink = document.querySelector(".dropdown");
    const funcionesDropdown = document.querySelector(".dropdown-content");

    funcionesLink.addEventListener("click", function (event) {
        event.preventDefault(); // Prevenir la acción por defecto del enlace
        funcionesDropdown.classList.toggle("show");
    });

    // Menú desplegable Soporte
    const soporteLink = document.querySelector(".dropdown");
    const soporteDropdown = document.querySelectorAll(".dropdown-content");

    soporteLink.addEventListener("click", function (event) {
        event.preventDefault(); // Prevenir la acción por defecto del enlace
        soporteDropdown.forEach(dropdown => {
            dropdown.classList.toggle("show");
        });
    });
});