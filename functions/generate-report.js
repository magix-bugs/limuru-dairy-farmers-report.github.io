const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: '/tmp' });

app.post('/upload-csv', upload.array('csvFiles', 40), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const allResults = [];

    req.files.forEach((file, index) => {
        const results = [];
        const tempFilePath = path.join('/tmp', file.originalname);

        fs.renameSync(file.path, tempFilePath);

        fs.createReadStream(tempFilePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                allResults.push({ filename: file.originalname, data: results });

                fs.unlinkSync(tempFilePath);

                if (allResults.length === req.files.length) {
                    const csvContent = formatAsCSV(allResults);
                    res.header('Content-Type', 'text/csv');
                    res.status(200).send(csvContent);
                }
            });
    });
});

function formatAsCSV(allResults) {
    let csvContent = '';

    const headers = Object.keys(allResults[0].data[0]).join(',');
    csvContent += `${headers}\n`;

    allResults.forEach(result => {
        result.data.forEach(row => {
            const values = Object.values(row).join(',');
            csvContent += `${values}\n`;
        });
    });

    return csvContent;
}

module.exports = app; // Export the Express app
