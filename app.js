require("dotenv").config();
const express = require('express');
const bodyParser = require ("body-parser");

const app = express();
app.use (bodyParser.json());
app.use (bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
console.log (PORT);

app.get('/', (req, res) => {
    res.send(`
        <h1> Curso Express.js </h1>
        <p>Esto es una app</p>
        <p>Corre en el puerto: ${PORT} </p>
    `);
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`Mostrar información del usuario con ID: ${userId}`);
});

app.get('/search', (req, res) => {
  const terms = req.query.termino || "no especificado";
  const category = req.query.categoria || "todas";
  
  res.send(`<h2>Resultados de búsqueda</h2>
            <p>Término: ${terms}</p>
            <p>Categoría: ${category}</p>`);
});

app.post('/form', (req, res) => {                                  //formulario
    const name = req.body.nombre || "anónimo";
    const email = req.body.email || "no proporcionado";
    
    res.json({
        message: "Datos recibidos",
        data: {
            name,
            email
        }
    });
});

app.post('/data', (req, res) => {
    const data = req.body;
    
    // Validación para asegurar que recibimos datos válidos
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            error: "No se recibieron datos"
        });
    }
    
    res.status(200).json({
        message: "Datos JSON recibidos",
        data
    });
});

app.listen(PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
});