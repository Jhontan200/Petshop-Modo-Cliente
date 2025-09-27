document.addEventListener("DOMContentLoaded", function () {
    const loginLink = document.getElementById("login-link");
    const logoutLink = document.getElementById("logout-link");

    // Si hay un correo guardado, mostrar cerrar sesión y ocultar iniciar sesión
    if (localStorage.getItem("usuarioEmail")) {
        loginLink.style.display = "none";      // Oculta el botón de iniciar sesión
        logoutLink.style.display = "inline-flex"; // Muestra cerrar sesión
    }

    // Cerrar sesión
    logoutLink.addEventListener("click", function (e) {
        e.preventDefault();
        if (confirm("¿Seguro que quieres cerrar sesión?")) {
            localStorage.removeItem("usuarioEmail");
            location.reload();
        }
    });
});
