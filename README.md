# 🛍️ Petshop Modo Cliente (Python / Flask)
## ⭐ Objetivo y Descripción del Proyecto

Petshop Modo Cliente es una aplicación web que simula un sistema de e-commerce conectado a una base de datos MySQL.
Su propósito principal es mostrar en tiempo real los productos disponibles en la base de datos y registrar las ventas realizadas por los clientes de forma automática.

## 🧰 Tecnologías y Herramientas
| Tecnología / Librería |	Rol |
|---------------------| -------- |
| 🐍 Python	| Lógica del servidor (backend).|
|🌐 JavaScript	| Interactividad y comunicación con el servidor (frontend). |
|🛢️ MySQL |	Base de datos para almacenar productos y ventas.|
| 🌶 Flask	| Micro-framework de Python para construir la aplicación web. |
| 📅 datetime	| Manejo de fechas y horas para el registro de ventas. |
| 🧭 mysql.connector |	Conexión entre Flask y la base de datos MySQL. |

## 🎬 Demostración en Video

A continuación puedes ver el funcionamiento de la aplicación web:

[![Demo del Proyecto](https://img.youtube.com/vi/8zsgxIG2t1Y/maxresdefault.jpg)](https://youtu.be/8zsgxIG2t1Y)

## 📦 Instalación y Configuración
### ✅ Prerrequisitos

Antes de iniciar, asegúrate de tener instalado:

* [Python 3](https://www.python.org/downloads/)

* [MySQL Workbench](https://www.mysql.com/products/workbench/)

* Un editor de código compatible (como [VS Code](https://code.visualstudio.com/))

## 🧭 Pasos de Instalación

1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/Jhontan200/Petshop-Modo-Cliente.git
cd Petshop-Cliente
```
2️⃣ Instalar Dependencias

Ejecuta el siguiente comando para instalar Flask y las librerías necesarias:

```bash
pip install flask mysql-connector-python
```
3️⃣ Configurar la Conexión a la Base de Datos ⚠️

Abre el archivo principal (app.py) y localiza la sección de conexión a MySQL.
Modifica los parámetros según tu configuración local:

```bash
mydb = mysql.connector.connect(
    host="localhost",
    user="[TU_USUARIO_MYSQL]",
    password="[TU_CONTRASEÑA]",
    database="[NOMBRE_DE_TU_BD]"
)
```
## 🚀 Ejecución del Proyecto
### ▶️ Iniciar el Servidor Flask

En la terminal, ejecuta:

```bash
python app.py
```

## 🌐 Acceder desde el Navegador

Una vez que Flask esté en ejecución, accede a:
👉 http://127.0.0.1:5002

Desde aquí podrás:

* 🧭 Navegar por los productos disponibles.

* 🛒 Simular compras y registrar ventas en la base de datos.

## 📌 Estructura Básica del Proyecto

```bash
Petshop-Cliente/
│
├── app.py                  # Archivo principal Flask
├── templates/              # Archivos HTML para la interfaz
├── static/                 # Archivos CSS / JS
├── LICENSE                 # Este archivo 📄
├── README.md               # Este archivo 📄
```

## 👨‍💻 Autor

Desarrollado por: [Jhontan200](https://github.com/Jhontan200)

## 📄 Licencia
Distribuido bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
[![GitHub license](https://img.shields.io/github/license/Jhontan200/Petshop-Modo-Cliente)](./LICENSE)  