const mysql = require('mysql');
const fs = require('fs');

// Configura los detalles de conexión a tu base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'citiesWorldWide'
});

const sqlQuery = `SELECT accommodates, bedrooms, price, minimum_nights, maximum_nights, availability_365, number_of_reviews, review_scores_rating, reviews_per_month, location.latitude, location.longitude
                  FROM accomodation
                  INNER JOIN location ON neighbourhood_id = location.id`;

connection.query(sqlQuery, (error, results) => {
  if (error) {
    throw error;
  }

  var updatedGeojson = {
    type: 'FeatureCollection',
    features: []
  };

  // Combina los datos de la tabla con el archivo GeoJSON
  results.forEach((row) => {
    var feature = {
      type: 'Feature',
      properties: {
        latitude: row.latitude,
        longitude: row.longitude,
        accommodates: row.accommodates,
        bedrooms: row.bedrooms,
        price: row.price,
        minimum_nights: row.minimum_nights,
        maximum_nights: row.maximum_nights,
        availability_365: row.availability_365,
        number_of_reviews: row.number_of_reviews,
        review_scores_rating: row.review_scores_rating,
        reviews_per_month: row.reviews_per_month
      },
      geometry: {
        type: 'Point',
        coordinates: [row.longitude, row.latitude]
      }
    };
    updatedGeojson.features.push(feature);
  });

  // Guardar el archivo GeoJSON actualizado
  const updatedGeojsonFilePath = 'DatasetHeatmap/heatmap.geojson';
  fs.writeFileSync(updatedGeojsonFilePath, JSON.stringify(updatedGeojson));
  console.log('Archivo ' + updatedGeojsonFilePath + ' guardado con éxito.');

  connection.end();

  // Salir del proceso de Node.js
  process.exit();
});