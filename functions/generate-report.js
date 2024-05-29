const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ dest: '/tmp' });

// Function to generate the report
const generateReport = async (files) => {
    const allResults = [];

    for (const file of files) {
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

    return allResults;
};

// Function to format report data as CSV content
const formatAsCSV = (allResults) => {
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
};

// POST endpoint to generate the report
app.post('/.netlify/functions/generate-report', upload.array('csvFiles', 40), async (req, res) => {
    console.log('Request received at /.netlify/functions/generate-report');
    console.log('Received files:', req.files);

    try {
        if (!req.files || req.files.length === 0) {
            console.log('No files uploaded');
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const allResults = await generateReport(req.files);
        const csvContent = formatAsCSV(allResults);

        const reportFilename = `report-${uuidv4()}.csv`;
        const reportFilePath = path.join('/tmp', reportFilename);
        
        fs.writeFileSync(reportFilePath, csvContent);

        // Send the file URL for downloading
        const downloadUrl = `/tmp/${reportFilename}`;
        res.status(200).json({ downloadUrl });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Serve the CSV file
app.get('/tmp/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('/tmp', filename);

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error serving file:', err);
            res.status(500).send('Failed to download file');
        } else {
            // Optionally delete the file after sending it
            fs.unlinkSync(filePath);
        }
    });
});

module.exports.handler = serverless(app);
