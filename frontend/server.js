/**
 * Servidor Express para servir la aplicación React en producción
 * Maneja el SPA routing redirigiendo todas las rutas no-estáticas a index.html
 */
const express = require('express');
const path = require('path');
const app = express();

// Directorio de archivos estáticos (build de React)
const buildPath = path.join(__dirname, 'build');

// Middleware para servir archivos estáticos
app.use(express.static(buildPath, {
  maxAge: '1d',
  etag: false,
  // Asegurar que los archivos estáticos se cacheen apropiadamente
}));

// Middleware para registrar requests (debug)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// SPA Routing: Todas las rutas que no sean archivos estáticos van a index.html
// Esto permite que React Router maneje el routing en el cliente
app.get('*', (req, res) => {
  // Si es una solicitud de archivo estático (tiene extensión), no llega aquí
  // Esta ruta solo se ejecuta para rutas sin extensión (ej: /login, /dashboard, etc)
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor React ejecutándose en puerto ${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${buildPath}`);
  console.log(`🔄 SPA routing habilitado: todas las rutas van a index.html`);
});
