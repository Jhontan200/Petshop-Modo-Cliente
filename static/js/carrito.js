document.querySelector(".cart img").addEventListener("click", () => {
    document.querySelector(".cart-container").classList.toggle("active");
});

document.querySelector(".close-cart").addEventListener("click", () => {
    document.querySelector(".cart-container").classList.remove("active");
});

let carrito = [];

// 🚀 Cargar carrito desde `localStorage` al abrir cualquier página
function cargarCarritoDesdeLocalStorage() {
    let carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        try {
            carrito = JSON.parse(carritoGuardado);
        } catch (error) {
            console.error("Error al cargar el carrito:", error);
            carrito = [];
        }
    } else {
        carrito = [];
    }
    actualizarCarrito();
}

// Guardar carrito en `localStorage`
function guardarCarritoEnLocalStorage() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// 🔹 Detectar clic en los botones "AGREGAR" de los productos de catálogo
document.querySelectorAll(".agregar").forEach((boton) => {
    boton.addEventListener("click", () => {
        let producto = boton.closest(".producto, .producto1, .producto2, .producto3, .producto4, .producto5, .producto6, .producto7, .producto8");
        let nombre = producto.querySelector("h3").textContent;
        let precio = parseFloat(producto.getAttribute("data-precio"));
        let cantidad = parseInt(producto.querySelector(".cantidad-input").value);
        let imagen = producto.querySelector("img").src;

        agregarAlCarrito(nombre, precio, cantidad, imagen);
        producto.querySelector(".cantidad-input").value = 1;
    });
});

function agregarAlCarrito(nombre, precio, cantidad, imagen) {
    let existe = carrito.find(item => item.nombre === nombre);

    if (existe) {
        existe.cantidad += cantidad;
    } else {
        carrito.push({ nombre, precio, cantidad, imagen });
    }

    guardarCarritoEnLocalStorage();
    actualizarCarrito();
}

function actualizarCarrito() {
    let contenedor = document.querySelector(".cart-items");
    contenedor.innerHTML = "";

    let total = 0;
    let totalProductos = 0;

    carrito.forEach((producto, index) => {
        let div = document.createElement("div");
        div.classList.add("cart-item");

        let nombreCorto = producto.nombre.length > 30 ? producto.nombre.substring(0, 30) + "..." : producto.nombre;
        let subtotal = (producto.precio * producto.cantidad).toFixed(2).replace(".", ",");
        totalProductos += producto.cantidad;

        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <span>${nombreCorto}</span>
            <div class="cantidad">
                <button class="decrementar-carrito" data-index="${index}">-</button>
                <span>${producto.cantidad}</span>
                <button class="incrementar-carrito" data-index="${index}">+</button>
            </div>
            <span class="subtotal">Bs. ${subtotal}</span>
            <button class="eliminar">
                <img src="https://img.icons8.com/ios-filled/50/trash.png" alt="Eliminar">
            </button>
        `;
        contenedor.appendChild(div);

        total += producto.precio * producto.cantidad;
    });

    let cartCount = document.querySelector(".cart-count");
    cartCount.textContent = totalProductos > 0 ? totalProductos : "";
    cartCount.style.display = totalProductos > 0 ? "flex" : "none";

    document.querySelector(".total-price").textContent = `Total: Bs. ${total.toFixed(2).replace(".", ",")}`;

    guardarCarritoEnLocalStorage();

    document.querySelectorAll(".eliminar").forEach((boton, index) => {
        boton.addEventListener("click", () => {
            let item = boton.closest(".cart-item");
            item.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
            item.style.opacity = "0";
            item.style.transform = "scale(0.8)";

            setTimeout(() => {
                carrito.splice(index, 1);
                actualizarCarrito();
            }, 300);
        });
    });

    document.querySelectorAll(".incrementar-carrito").forEach((boton, index) => {
        boton.addEventListener("click", () => {
            carrito[index].cantidad++;
            actualizarCarrito();
        });
    });

    document.querySelectorAll(".decrementar-carrito").forEach((boton, index) => {
        boton.addEventListener("click", () => {
            if (carrito[index].cantidad > 1) {
                carrito[index].cantidad--;
                actualizarCarrito();
            }
        });
    });
}

// 🛒 Vaciar carrito
document.querySelector(".vaciar-carrito").addEventListener("click", () => {
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarCarrito();
    alert("¡Carrito vacío! Puedes empezar una nueva compra.");
});


// 🔹 Cerrar carrito cuando se toca fuera de la ventana, pero NO si se hace clic en botones internos
document.addEventListener("click", (event) => {
    const cartContainer = document.querySelector(".cart-container");
    const cartIcon = document.querySelector(".cart img");

    if (!cartContainer.contains(event.target) && 
        !cartIcon.contains(event.target) && 
        !event.target.classList.contains("incrementar-carrito") && 
        !event.target.classList.contains("decrementar-carrito") && 
        !event.target.classList.contains("eliminar") && 
        !event.target.classList.contains("vaciar-carrito") && 
        !event.target.classList.contains("finalizar-compra") && 
        !event.target.closest(".eliminar")) {
        cartContainer.classList.remove("active");
    }
});

// 🚀 Cargar el carrito cuando se abre cualquier página
cargarCarritoDesdeLocalStorage();


// ✅ FUNCIONALIDAD PARA EL PRODUCTO INDIVIDUAL
const botonAgregarDetalle = document.querySelector(".info-pro-agregar");
if (botonAgregarDetalle) {
    botonAgregarDetalle.addEventListener("click", () => {
        const contenedorProducto = botonAgregarDetalle.closest(".info-pro-producto");

        const nombre = contenedorProducto.querySelector(".info-pro-nombre").textContent;
        const precio = parseFloat(contenedorProducto.querySelector(".info-pro-precio").dataset.precio);
        const imagen = contenedorProducto.querySelector(".info-pro-imagen img").src;
        const cantidad = parseInt(contenedorProducto.querySelector(".info-pro-valor").textContent);

        agregarAlCarrito(nombre, precio, cantidad, imagen);

        // Reiniciar cantidad a 1
        contenedorProducto.querySelector(".info-pro-valor").textContent = "1";
    });
}

const botonIncrementar = document.querySelector(".info-pro-incrementar");
const botonDecrementar = document.querySelector(".info-pro-decrementar");
const cantidadSpan = document.querySelector(".info-pro-valor");

if (botonIncrementar && botonDecrementar && cantidadSpan) {
    botonIncrementar.addEventListener("click", () => {
        let cantidad = parseInt(cantidadSpan.textContent);
        cantidadSpan.textContent = cantidad + 1;
    });

    botonDecrementar.addEventListener("click", () => {
        let cantidad = parseInt(cantidadSpan.textContent);
        if (cantidad > 1) {
            cantidadSpan.textContent = cantidad - 1;
        }
    });
}
