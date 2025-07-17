// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Importa el módulo express para crear y manejar el servidor
const express = require('express');

// Importa PrismaClient desde la ruta donde fue generado
// La ruta ha sido ajustada a './generated/prisma' para que coincida con la salida de 'npx prisma generate'
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient(); // Inicializa el cliente de Prisma

// Importa middlewares personalizados
const LoggerMiddleware = require('./middlewares/logger'); // Middleware para logging
const errorHandler = require('./middlewares/errorHandler'); // Middleware para manejo de errores
const { validateUser } = require('./utils/validation'); // Utilidad para validación de usuarios

// Importa body-parser para parsear el cuerpo de las solicitudes HTTP
const bodyParser = require('body-parser');

// Importa módulos para manejo de archivos y rutas
const fs = require('fs'); // Para operaciones de sistema de archivos
const path = require('path'); // Para trabajar con rutas de archivos y directorios
const usersFilePath = path.join(__dirname, 'users.json'); // Ruta al archivo JSON de usuarios

// Crea una instancia de la aplicación Express
const app = express();

// Configura middlewares globales
app.use(bodyParser.json()); // Para parsear cuerpos de solicitud JSON
app.use(bodyParser.urlencoded({ extended: true })); // Para parsear cuerpos de solicitud URL-encoded
app.use(LoggerMiddleware); // Usa el middleware de logging para todas las solicitudes
app.use(errorHandler); // Usa el middleware de manejo de errores para capturar errores

// Define el puerto del servidor, usando la variable de entorno PORT o el puerto 3000 por defecto
const PORT = process.env.PORT || 3000;
console.log(PORT); // Muestra el puerto en la consola

// --- Rutas de la Aplicación ---

// Ruta principal (GET /)
app.get('/', (req, res) => {
    res.send(`
        <h1>Curso Express.js V3</h1>
        <p>Esto es una aplicación node.js con express.js</p>
        <p>Corre en el puerto: ${PORT}</p>
    `);
});

// Ruta para obtener información de un usuario por ID (GET /users/:id)
app.get('/users/:id', (req, res) => {
    const userId = req.params.id; // Obtiene el ID del usuario de los parámetros de la URL
    res.send(`Mostrar información del usuario con ID: ${userId}`);
});

// Ruta de búsqueda (GET /search)
app.get('/search', (req, res) => {
    // Obtiene los términos de búsqueda y categoría de los parámetros de consulta (query parameters)
    const terms = req.query.termino || 'No especificado';
    const category = req.query.categoria || 'Todas';

    res.send(`
        <h2>Resultados de Busqueda:</h2>
        <p>Término: ${terms}</p>
        <p>Categoría: ${category}</p>
    `);
});

// Ruta para manejar el envío de formularios (POST /form)
app.post('/form', (req, res) => {
    // Obtiene el nombre y el email del cuerpo de la solicitud (body)
    const name = req.body.nombre || 'Anónimo';
    const email = req.body.email || 'No proporcionado';
    res.json({
        message: 'Datos recibidos',
        data: {
            name,
            email
        }
    });
});

// Ruta para recibir datos JSON (POST /api/data)
app.post('/api/data', (req, res) => {
    const data = req.body; // Obtiene los datos JSON del cuerpo de la solicitud

    // Valida si se recibieron datos
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No se recibieron datos' });
    }

    res.status(201).json({
        message: 'Datos JSON recibidos',
        data
    });
});

// Ruta para obtener todos los usuarios desde un archivo JSON (GET /users)
app.get('/users', (req, res) => {
    fs.readFile(usersFilePath, 'utf-8', (err, data) => {
        if (err) {
            // Si hay un error al leer el archivo, devuelve un error 500
            return res.status(500).json({ error: 'Error con conexión de datos.' });
        }
        const users = JSON.parse(data); // Parsea los datos JSON del archivo
        res.json(users); // Envía los usuarios como respuesta JSON
    });
});

// Ruta para agregar un nuevo usuario a un archivo JSON (POST /users)
app.post('/users', (req, res) => {
    const newUser = req.body; // Obtiene el nuevo usuario del cuerpo de la solicitud
    fs.readFile(usersFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error con conexión de datos.' });
        }
        const users = JSON.parse(data); // Obtiene los usuarios existentes

        const validation = validateUser(newUser, users); // Valida el nuevo usuario
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error }); // Si la validación falla, devuelve un error 400
        }

        users.push(newUser); // Agrega el nuevo usuario al array
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), err => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar el usuario.' });
            }
            res.status(201).json(newUser); // Devuelve el nuevo usuario con un estado 201 (Creado)
        });
    });
});

// Ruta para actualizar un usuario existente en un archivo JSON (PUT /users/:id)
app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10); // Obtiene el ID del usuario a actualizar
    const updatedUser = req.body; // Obtiene los datos actualizados del usuario

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error con conexión de datos.' });
        }
        let users = JSON.parse(data); // Obtiene los usuarios existentes

        const validation = validateUser(updatedUser, users); // Valida los datos actualizados
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
        }

        // Mapea los usuarios para encontrar y actualizar el usuario con el ID coincidente
        users = users.map(user =>
            user.id === userId ? { ...user, ...updatedUser } : user
        );
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), err => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: 'Error al actualizar el usuario' });
            }
            res.json(updatedUser); // Devuelve el usuario actualizado
        });
    });
});

// Ruta para eliminar un usuario de un archivo JSON (DELETE /users/:id)
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10); // Obtiene el ID del usuario a eliminar
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error con conexión de datos.' });
        }
        let users = JSON.parse(data); // Obtiene los usuarios existentes
        users = users.filter(user => user.id !== userId); // Filtra para eliminar el usuario con el ID coincidente
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), err => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar usuario.' });
            }
            res.status(204).send(); // Devuelve un estado 204 (Sin Contenido) para indicar éxito sin cuerpo de respuesta
        });
    });
});

// Ruta para probar el middleware de manejo de errores (GET /error)
app.get('/error', (req, res, next) => {
    next(new Error('Error Intencional')); // Lanza un error intencional para que sea capturado por el middleware
});

// Ruta para obtener usuarios desde la base de datos usando Prisma (GET /db-users)
app.get('/db-users', async (req, res) => {
    try {
        const users = await prisma.user.findMany(); // Busca todos los usuarios en la base de datos
        res.json(users); // Devuelve los usuarios como JSON
    } catch (error) {
        // Si hay un error al comunicarse con la base de datos, devuelve un error 500
        res
            .status(500)
            .json({ error: 'Error al comunicarse con la base de datos.' });
    }
});

// Inicia el servidor Express en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`); // Muestra la URL del servidor en la consola
});
