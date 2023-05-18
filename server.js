const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/api/getFilenames') {
    // Directory path to retrieve filenames
    const directoryPath = 'DatasetUpdated';

    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Error al leer el directorio:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al leer el directorio' }));
        return;
      }

      // Filter the filenames to exclude directories
      const filenames = files.filter((file) => path.extname(file).toLowerCase() === '.geojson');

      // Send the filenames as the JSON response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(filenames));
    });
  } else {
    // Ruta a tu archivo HTML y el directorio Dataset
    const filePath = req.url === '/' ? '/price.html' : req.url;
    const fullPath = path.join(__dirname, filePath);

    // Determina el tipo de contenido basado en la extensión del archivo
    const contentType = getContentType(filePath);

    // Lee el archivo y envíalo como respuesta
    fs.readFile(fullPath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Archivo no encontrado ${filePath}`);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  }
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
