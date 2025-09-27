let cantidades = Array.from(document.querySelectorAll(".cantidad-input")).map(() => 1);

// Delegación de eventos para mejorar rendimiento en los botones de cantidad
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("incrementar")) {
        let index = event.target.getAttribute("data-index");
        cantidades[index]++;
        document.querySelector(`.cantidad-input[data-index="${index}"]`).value = cantidades[index];
    }

    if (event.target.classList.contains("decrementar")) {
        let index = event.target.getAttribute("data-index");
        if (cantidades[index] > 1) {
            cantidades[index]--;
            document.querySelector(`.cantidad-input[data-index="${index}"]`).value = cantidades[index];
        }
    }
});

// Variable para almacenar los filtros seleccionados
let seleccionados = [];

document.querySelectorAll('.filtro').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        let valor = this.value;

        // Agregar o quitar filtros seleccionados
        if (this.checked) {
            if (!seleccionados.includes(valor)) {
                seleccionados.push(valor);
            }
        } else {
            seleccionados = seleccionados.filter(item => item !== valor);
        }

        if (window.innerWidth > 800) { // Aplica los filtros automáticamente en pantallas grandes
            aplicarFiltros(seleccionados);
        }
    });
});

// Función optimizada para aplicar filtros sin modificar el tamaño del filtrador
function aplicarFiltros(seleccionados) {
    const productos = Array.from(document.querySelectorAll(".producto, .producto1, .producto2, .producto3, .producto4, .producto5, .producto6, .producto7, .producto8"));

    if (seleccionados.length === 0) {
        // Si no hay filtros activos, mostrar todos los productos
        productos.forEach(producto => {
            producto.style.display = "flex";
            producto.style.visibility = "visible";
        });
    } else {
        // Filtrar productos según los checkboxes seleccionados
        let productosVisibles = productos.filter(producto => {
            return ["categoria", "marca", "peso", "edad"].some(atributo => {
                let valores = (producto.getAttribute(`data-${atributo}`) || "").split(/[, ]+/); // Convertir `data-*` en array
                return valores.some(valor => seleccionados.includes(valor)); // Comparar con los filtros seleccionados
            });
        });

        // Mostrar los productos que cumplen con el filtro
        productosVisibles.forEach(producto => {
            producto.style.display = "flex";
            producto.style.visibility = "visible";
        });

        // Ocultar los productos que no cumplen con el filtro
        productos.forEach(producto => {
            if (!productosVisibles.includes(producto)) {
                producto.style.display = "none";
                producto.style.visibility = "hidden";
            }
        });
    }
}

// Botón para aplicar los filtros en pantallas pequeñas
document.querySelector(".aplicar-filtros").addEventListener("click", function() {
    let seleccionados = Array.from(document.querySelectorAll(".filtro:checked"))
        .map(checkbox => checkbox.value);

    aplicarFiltros(seleccionados);

    // Cerrar el panel de filtros después de aplicar
    document.querySelector(".filtros").classList.remove("mostrar");
});

// MOSTRAR y OCULTAR filtro lateral en móviles
const botonFiltros = document.querySelector(".boton-filtros");
const panelFiltros = document.querySelector(".filtros");
const cerrarFiltros = document.querySelector(".cerrar-filtros");

if (botonFiltros && panelFiltros && cerrarFiltros) {
    botonFiltros.addEventListener("click", () => {
        panelFiltros.classList.toggle("mostrar");
    });

    cerrarFiltros.addEventListener("click", () => {
        panelFiltros.classList.remove("mostrar");
    });

    // Cerrar si se hace clic fuera del panel de filtros en móviles
    window.addEventListener("click", (e) => {
        if (
            panelFiltros.classList.contains("mostrar") &&
            !panelFiltros.contains(e.target) &&
            !botonFiltros.contains(e.target)
        ) {
            panelFiltros.classList.remove("mostrar");
        }
    });
}

// Botón para limpiar la selección de los checkboxes
document.querySelector(".limpiar-filtros").addEventListener("click", function() {
    document.querySelectorAll(".filtro").forEach(checkbox => {
        checkbox.checked = false;
    });

    // Limpiar la variable de filtros seleccionados
    seleccionados = [];
});

// Función para mostrar y ocultar secciones de filtros con iconos dinámicos
function toggleSection(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector(".icon");

    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block"; // Mostrar filtros
        icon.textContent = "▲"; // Cambiar icono
        header.classList.add("activo"); // Aplicar cambio de color al texto y línea
    } else {
        content.style.display = "none"; // Ocultar filtros
        icon.textContent = "▼"; // Restaurar icono
        header.classList.remove("activo"); // Volver al color original
    }
}
