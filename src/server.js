const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutÃ¡ndose en http://localhost:${PORT}`);
});