from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime
import mysql.connector

app = Flask(__name__)

# Conexión a la base de datos
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Isaias20@04@",
        database="PETSHOP"
    )

# Definir el filtro personalizado ljust
def ljust_filter(value, length=32):
    return value.ljust(length)

# Registrar el filtro en Flask
app = Flask(__name__)
app.jinja_env.filters['ljust'] = ljust_filter  

@app.route('/')


@app.route('/catalogo')
def catalogo():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_producto, nombre, precio FROM PRODUCTO")
    productos = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template("catalogo.html", productos=productos)

@app.route('/formulario_pago')
def formulario_pago():
    return render_template('formulario_pago.html')

@app.route('/verificar_correo', methods=['POST'])
def verificar_correo():
    data = request.json
    correo = data.get('correo')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM CLIENTE WHERE usuario = %s", (correo,))
    cliente = cursor.fetchone()
    cursor.close()
    conn.close()

    if cliente:
        return jsonify({"existe": True, "cliente": cliente})
    else:
        return jsonify({"existe": False}), 404

from difflib import get_close_matches  # Import para búsqueda aproximada

@app.route('/procesar_compra', methods=['POST'])
def procesar_compra():
    try:
        # Obtener los datos del frontend
        data = request.json
        correo = data.get('correo')
        carrito = data.get('carrito')

        print(f"Datos recibidos: {data}")  # Depuración

        if not correo or not carrito:
            return jsonify({"mensaje": "Datos incompletos: se requiere correo y carrito"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificar el correo
        cursor.execute("SELECT id_cliente FROM CLIENTE WHERE usuario = %s", (correo,))
        cliente = cursor.fetchone()

        if not cliente:
            return jsonify({"mensaje": "El correo no está registrado."}), 400

        # Procesar los productos en el carrito
        for item in carrito:
            nombre_producto = item.get('nombre')
            cantidad = item.get('cantidad')

            if not nombre_producto or not cantidad:
                return jsonify({"mensaje": f"Datos incompletos para el producto: {item}"}), 400

            # Depuración: Mostrar nombre y cantidad del producto
            print(f"Producto recibido: Nombre = {nombre_producto}, Cantidad = {cantidad}")

            # Buscar coincidencias aproximadas en la base de datos
            cursor.execute("SELECT id_producto, nombre, stock FROM PRODUCTO")
            productos = cursor.fetchall()
            print(f"Productos recuperados: {productos}")  # Depuración

            # Obtener nombres para búsqueda
            nombres_db = [prod[1] for prod in productos]  # Ajustar índice según lo recuperado
            print(f"Nombres disponibles en la base de datos: {nombres_db}")  # Depuración

            # Buscar coincidencias aproximadas
            coincidencias = get_close_matches(nombre_producto, nombres_db, n=1, cutoff=0.5)

            if not coincidencias:
                return jsonify({"mensaje": f"No se encontró un producto similar para: {nombre_producto}"}), 400

            # Producto más similar
            producto_similar = next(prod for prod in productos if prod[1] == coincidencias[0])
            id_producto = producto_similar[0]  # Índice ajustado para id_producto
            stock_disponible = producto_similar[2]  # Índice ajustado para stock

            print(f"Producto similar encontrado: {producto_similar}")  # Depuración

            # Verificar si el stock es suficiente
            if stock_disponible < cantidad:
                return jsonify({"mensaje": f"Stock insuficiente para el producto: {producto_similar[1]}"}), 400

            # Reducir stock del producto
            cursor.execute(
                "UPDATE PRODUCTO SET stock = stock - %s WHERE id_producto = %s",
                (cantidad, id_producto)
            )

            # Registrar la venta
            fecha_actual = datetime.now().date()
            hora_actual = datetime.now().time()
            cursor.execute(
                "INSERT INTO VENTAS (id_producto, cantidad, fecha, hora) VALUES (%s, %s, %s, %s)",
                (id_producto, cantidad, fecha_actual, hora_actual)
            )

        # Confirmar las transacciones en la base de datos
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"mensaje": "Compra procesada exitosamente"})
    
    except Exception as e:
        # Capturar errores inesperados y enviar mensaje al frontend
        print(f"Error al procesar compra: {e}")
        return jsonify({"mensaje": "Error interno en el servidor"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)