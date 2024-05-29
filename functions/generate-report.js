const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: '/tmp' });

app.post('/.netlify/functions/generate-report', upload.array('csvFiles', 40), async (req, res) => {
    console.log('Request received at /.netlify/functions/generate-report');
    console.log('Received files:', req.files); // Log received files

    try {
        if (!req.files || req.files.length === 0) {
            console.log('No files uploaded');
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const allResults = [];

        for (const file of req.files) {
            const results = [];
            const tempFilePath = path.join('/tmp', file.originalname);

            console.log(`Processing file: ${file.originalname}`);

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
                    .on('error', (error) => {
                        console.error(`Error processing file ${file.originalname}:`, error);
                        reject(error);
                    });
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

    if (allResults.length === 0 || allResults[0].data.length === 0) {
        return csvContent;
    }

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
