import express from 'express';
import multer from 'multer';
import fs from 'fs';
import csvParser from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

// Ruta para recibir el archivo CSV y procesarlo
app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
            results.push(row);
        })
        .on('end', () => {
            const totalRows = results.length;
            const chunkSize = 999000;

            // Variable para almacenar el nombre del archivo generado
            let downloadFileName = `output.csv`;
            const outputFilePath = path.join(__dirname, downloadFileName);

            const csvHeaders = Object.keys(results[0]).join(',') + '\n';
            const csvData = results.map(row => Object.values(row).join(',')).join('\n');
            fs.writeFileSync(outputFilePath, csvHeaders + csvData);

            res.send({ message: 'Archivo procesado y dividido correctamente', filename: downloadFileName });
        });
});

// Ruta para descargar el archivo generado
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, filename);
    res.download(filePath, (err) => {
        if (err) {
            console.error(err);
            res.status(404).send('File not found');
        }
    });
});

// Inicia el servidor en el puerto 3001
app.listen(3001, () => {
    console.log('Servidor iniciado en http://localhost:3001');
});
