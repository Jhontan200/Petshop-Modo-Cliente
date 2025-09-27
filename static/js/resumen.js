document.addEventListener("DOMContentLoaded", () => {
    const resumenContenedor = document.querySelector(".pago-cart-items");
    const totalElemento = document.querySelector(".pago-total");
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    function guardarCarrito() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    function actualizarTotal() {
        const total = carrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
        totalElemento.textContent = `Total: Bs. ${total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;
    }

    function mostrarResumenCarrito() {
        resumenContenedor.innerHTML = "";

        if (carrito.length === 0) {
            resumenContenedor.innerHTML = "<p>El carrito está vacío.</p>";
            totalElemento.textContent = "Total: Bs. 0,00";
            return;
        }

        carrito.forEach((producto, index) => {
            const item = document.createElement("div");
            item.classList.add("pago-cart-item");

            item.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="pago-img">
                <div class="pago-item-detalles">
                    <h4>${producto.nombre}</h4>
                    <p>Precio: Bs. ${producto.precio.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
                    <div class="pago-controles">
                        <button class="menos" data-index="${index}">-</button>
                        <span>${producto.cantidad}</span>
                        <button class="mas" data-index="${index}">+</button>
                        <button class="eliminar" data-index="${index}">🗑</button>
                    </div>
                    <p>Subtotal: Bs. ${(producto.precio * producto.cantidad).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
                </div>
            `;
            resumenContenedor.appendChild(item);
        });

        actualizarTotal();
    }

    resumenContenedor.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        if (e.target.classList.contains("mas")) {
            carrito[index].cantidad++;
        } else if (e.target.classList.contains("menos")) {
            if (carrito[index].cantidad > 1) carrito[index].cantidad--;
        } else if (e.target.classList.contains("eliminar")) {
            carrito.splice(index, 1);
        }
        guardarCarrito();
        mostrarResumenCarrito();
    });

    document.querySelector(".pago-vaciar").addEventListener("click", () => {
        localStorage.removeItem("carrito");
        carrito = [];
        mostrarResumenCarrito();
        actualizarTotal();
    });

    document.querySelector(".pago-finalizar").addEventListener("click", async () => {
        const correo = document.querySelector("#correo").value.trim();
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        if (!correo) {
            alert("⚠️ Debes ingresar un correo antes de finalizar la compra.");
            return;
        }

        // ✅ Verificar si el correo existe en el backend antes de finalizar la compra
        try {
            const verificarCorreoResponse = await fetch("/verificar_correo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo })
            });

            if (!verificarCorreoResponse.ok) {
                alert("⚠️ El correo ingresado no está registrado. Por favor, crea una cuenta o inicia sesión.");
                return;
            }
        } catch (error) {
            console.error("Error al verificar el correo:", error);
            alert("❌ Ocurrió un error al verificar el correo. Inténtalo nuevamente.");
            return;
        }

        if (!validarFormulario()) return;

        // ✅ Procesar la compra en el backend: reduce stock y registra la venta
        try {
            const procesarCompraResponse = await fetch("/procesar_compra", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, carrito })
            });

            const data = await procesarCompraResponse.json();

            if (!procesarCompraResponse.ok) {
                alert(data.mensaje || "❌ Error al procesar la compra.");
                return;
            }

            alert("✅ ¡Compra procesada exitosamente!");
            location.reload(); // Esto recarga la página después de aceptar la alerta

        } catch (error) {
            console.error("Error al procesar la compra:", error);
            alert("❌ Ocurrió un error al finalizar la compra.");
            return;
        }

        // ✅ Generar la factura PDF con los datos de la compra
        generarFacturaPDF(correo);

        // Limpiar el carrito y restablecer el formulario
        localStorage.removeItem("carrito");
        carrito = [];
        mostrarResumenCarrito();
        document.querySelector("#pago-form-datos").reset();

        // Quitar el método de pago seleccionado
        document.querySelector("#metodo-seleccionado").value = ""; // Limpia el campo oculto
        document.querySelectorAll('.metodo-img').forEach(img => img.classList.remove('seleccionado')); // Limpia las clases seleccionadas

    });

    function generarFacturaPDF(correo) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });

        const logo = new Image();
        logo.src = "/static/images/Logo.png";
        doc.addImage(logo, "PNG", 10, 10, 50, 20);

        const nombre = document.querySelector("#nombre").value.trim();
        const direccion = document.querySelector("#direccion").value.trim();
        const telefono = document.querySelector("#telefono").value.trim();
        const departamento = document.querySelector("#departamento").value;
        const metodoPago = document.querySelector("#metodo-seleccionado").value;

        const numeroFactura = Math.floor(100000 + Math.random() * 900000);
        const fechaHora = new Date();
        const fechaCompra = fechaHora.toLocaleDateString();
        const horaCompra = fechaHora.toLocaleTimeString();

        let y = 40;
        doc.setFontSize(16);
        doc.text("Factura de Compra", 120, y, { align: "center" });
        y += 10;

        doc.setFontSize(12);
        doc.text(`N° de Factura: ${numeroFactura}`, 10, y); y += 7;
        doc.text(`Fecha: ${fechaCompra}`, 10, y);
        doc.text(`Hora: ${horaCompra}`, 10, y + 7); y += 14;
        doc.text(`Nombre: ${nombre}`, 10, y); y += 7;
        doc.text(`Correo: ${correo}`, 10, y); y += 7; // ✅ Se agregó el correo en la factura
        doc.text(`Dirección: ${direccion}`, 10, y); y += 7;
        doc.text(`Teléfono: ${telefono}`, 10, y); y += 7;
        doc.text(`Departamento: ${departamento}`, 10, y); y += 7;
        doc.text(`Método de pago: ${metodoPago}`, 10, y); y += 10;

        doc.text("Productos adquiridos:", 10, y); y += 7;
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        carrito.forEach((producto, i) => {
            doc.text(
                `${i + 1}. ${producto.nombre} - Cantidad: ${producto.cantidad} - Precio unitario: Bs. ${producto.precio.toLocaleString('es-BO', { minimumFractionDigits: 2 })} - Subtotal: Bs. ${(producto.cantidad * producto.precio).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`,
                10,
                y
            );
            y += 7;
        });

        const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
        y += 10;
        doc.setFontSize(14);
        doc.text(`Total a pagar: Bs. ${total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`, 10, y);

        doc.save(`Factura_${numeroFactura}.pdf`);
    }

    mostrarResumenCarrito();

});
function validarFormulario() {
    const nombre = document.querySelector("#nombre").value.trim();
    const direccion = document.querySelector("#direccion").value.trim();
    const telefono = document.querySelector("#telefono").value.trim();
    const departamento = document.querySelector("#departamento").value;
    const metodoPago = document.querySelector("#metodo-seleccionado").value;
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // ✅ Validación de nombre: Solo letras y espacios
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
        alert("⚠️ El campo 'Nombre completo' solo permite letras y espacios.");
        return false;
    }

    // ✅ Validación de dirección: No puede estar vacía
    if (direccion === "") {
        alert("⚠️ Por favor, ingrese su dirección.");
        return false;
    }

    // ✅ Validación de teléfono: Exactamente 8 dígitos
    if (!/^\d{8}$/.test(telefono)) {
        alert("⚠️ El campo 'Teléfono' debe contener exactamente 8 dígitos.");
        return false;
    }

    // ✅ Validación de departamento: Debe ser seleccionado
    if (departamento === "") {
        alert("⚠️ Por favor, seleccione un departamento.");
        return false;
    }

    // ✅ Validación de método de pago: No puede estar vacío
    if (!metodoPago) {
        alert("⚠️ Debes seleccionar un método de pago antes de finalizar la compra.");
        return false;
    }

    // ✅ Validación de carrito: No debe estar vacío
    if (carrito.length === 0) {
        alert("⚠️ El carrito está vacío, agregue productos antes de finalizar la compra.");
        return false;
    }

    return true; // Todo está correcto
}


function mostrarModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}
function confirmarTarjeta() {
    const numTarjeta = document.getElementById('numero-tarjeta').value.trim();
    const codSeguridad = document.getElementById('codigo-seguridad').value.trim();

    if (!/^\d{16}$/.test(numTarjeta)) {
        alert('El número de tarjeta debe tener exactamente 16 dígitos.');
        return;
    }
    if (!/^\d{4}$/.test(codSeguridad)) {
        alert('El código de seguridad debe tener exactamente 4 dígitos.');
        return;
    }

    document.getElementById('metodo-seleccionado').value = 'Tarjeta';
    document.getElementById('opcion-tarjeta').classList.add('seleccionado');
    cerrarModal('modal-tarjeta');
}
function confirmarTransferencia() {
    document.getElementById('metodo-seleccionado').value = 'Transferencia';
    document.getElementById('opcion-transferencia').classList.add('seleccionado');
    cerrarModal('modal-transferencia');
}

function seleccionarMetodo(metodo) {
    document.querySelectorAll('.metodo-img').forEach(img => img.classList.remove('seleccionado'));

    if (metodo === 'Tarjeta') {
        mostrarModal('modal-tarjeta');
    } else if (metodo === 'Transferencia') {
        mostrarModal('modal-transferencia');
        generarQR();
    } else {
        document.getElementById('metodo-seleccionado').value = 'Efectivo';
        document.getElementById('opcion-efectivo').classList.add('seleccionado');
    }
}

function generarQR() {
    const canvas = document.getElementById('qr-canvas');
    QRCode.toCanvas(canvas, 'Transferencia completa - Gracias por tu compra', function (error) {
        if (error) console.error(error);
    });
}