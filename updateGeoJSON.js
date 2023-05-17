const fs = require('fs');
const mysql = require('mysql');
const path = require('path');

// Configura los detalles de conexión a tu base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'citiesWorldWide'
});


// Lee todos los archivos en el directorio
fs.readdir('Dataset', (err, files) => {
    if (err) {
        console.error('Error al leer el directorio:', err);
        return;
    }

    // Filtra los archivos que tienen extensión .geojson
    const geojsonFiles = files.filter((file) => path.extname(file).toLowerCase() === '.geojson');

    // Recorre los archivos geojson
    geojsonFiles.forEach((file, index) => {
        // Cargar GeoJSON
        var geojsonData = JSON.parse(fs.readFileSync('Dataset/' + file, 'utf8'));
        // Crea un objeto para almacenar el nuevo GeoJSON actualizado
        var updatedGeojson = {
            type: 'FeatureCollection',
            features: []
        };
        // Obtiene el nombre del archivo sin la extensión
        const nameWithoutExtension = path.parse(file).name.replace(" ", "");

        const sqlQuery = `SELECT avg(accommodates) as accommodates, avg(bedrooms) as bedrooms, avg(price) as price, avg(minimum_nights) as minimum_nights, avg(maximum_nights) as maximum_nights, avg(availability_365) as availability_365, avg(number_of_reviews) as number_of_reviews, avg(review_scores_rating) as review_scores_rating, avg(reviews_per_month) as reviews_per_month, neighbourhood_cleansed
                  FROM accomodation
                  INNER JOIN location ON neighbourhood_id = location.id
                  GROUP BY neighbourhood_cleansed`;

        connection.query(sqlQuery, (error, results) => {
            if (error) {
                throw error;
            }

            // Combina los datos de la tabla con el archivo GeoJSON
            results.forEach((row) => {
                // Busca la característica correspondiente en el archivo GeoJSON basada en el campo "neighbourhood"
                const feature = geojsonData.features.find((feature) => {
                    return feature.properties.neighbourhood === row.neighbourhood_cleansed;
                });

                // Si se encuentra la característica, agrega los campos
                if (feature) {
                    feature.properties.accommodates = row.accommodates;
                    feature.properties.bedrooms = row.bedrooms;
                    feature.properties.price = row.price;
                    feature.properties.minimum_nights = row.minimum_nights;
                    feature.properties.maximum_nights = row.maximum_nights;
                    feature.properties.availability_365 = row.availability_365;
                    feature.properties.number_of_reviews = row.number_of_reviews;
                    feature.properties.review_scores_rating = row.review_scores_rating;
                    feature.properties.reviews_per_month = row.reviews_per_month;
                    updatedGeojson.features.push(feature);
                }
            });

            // Guardar el archivo GeoJSON actualizado
            const updatedGeojsonFilePath = 'DatasetUpdated/' + nameWithoutExtension + '_actualizado.geojson';
            require('fs').writeFileSync(updatedGeojsonFilePath, JSON.stringify(geojsonData));
            console.log('Archivo ' + updatedGeojsonFilePath + ' guardado con éxito.');

            // Verificar si es la última iteración
            if (index === geojsonFiles.length - 1) {
                // Cerrar la conexión a la base de datos
                connection.end();

                // Salir del proceso de Node.js
                process.exit();
            }
        });
    });
});
