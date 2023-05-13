const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Ruta a tu archivo HTML y el directorio Dataset
  const filePath = req.url === '/' ? '/index.html' : req.url;
  const fullPath = path.join(__dirname, filePath);

  // Determina el tipo de contenido basado en la extensión del archivo
  const contentType = getContentType(filePath);

  // Lee el archivo y envíalo como respuesta
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Archivo no encontrado');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const port = 8000;

server.listen(port, () => {
  console.log(`Servidor web iniciado en http://localhost:${port}`);
});

// Función para determinar el tipo de contenido en función de la extensión del archivo
function getContentType(filePath) {
  const extname = path.extname(filePath);
  switch (extname) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    default:
      return 'text/plain';
  }
}
