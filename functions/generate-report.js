const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: '/tmp' });

// Async handler function with event parameter
app.post('/.netlify/functions/generate-report', upload.array('csvFiles', 40), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const allResults = [];

        for (const file of req.files) {
            const results = [];
            const tempFilePath = path.join('/tmp', file.originalname);

            fs.renameSync(file.path, tempFilePath);

            await new Promise((resolve, reject) => {
                fs.createReadStream(tempFilePath)
                    .pipe(csvParser())
                    .on('data', (data) => results.push(data))
                    .on('end', () => {
                        allResults.push({ filename: file.originalname, data: results });
                        fs.unlinkSync(tempFilePath);
                        resolve();
                    })
                    .on('error', (error) => reject(error));
            });
        }

        const csvContent = formatAsCSV(allResults);
        res.header('Content-Type', 'text/csv');
        res.status(200).send(csvContent);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
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

module.exports.handler = serverless(app);
