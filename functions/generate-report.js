const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ dest: '/tmp' });

const routes = [
    'R001', 'R002', 'R003', 'R004', 'R005', 'R006', 'R007', 'R008', 'R009', 'R010',
    'R011', 'R012', 'R013', 'R014', 'R015', 'R016', 'R017', 'R018', 'R019', 'R020',
    'R021', 'R022', 'R023', 'R024', 'R025', 'R026', 'R027', 'R028', 'R030', 'R031',
    'R032', 'R033', 'R033A', 'R034', 'R035', 'R036', 'R037', 'R038', 'R039', 'R040',
    'R041', 'R042', 'Zone001'
];

// Function to generate the report
const generateReport = async (files) => {
    const allResults = [];

    for (const file of files) {
        const results = [];
        const tempFilePath = path.join('/tmp', file.originalname);
        let newFilename = file.originalname;

        console.log(`Processing file: ${file.originalname}`);

        fs.renameSync(file.path, tempFilePath);

        await new Promise((resolve, reject) => {
            fs.createReadStream(tempFilePath)
                .pipe(csvParser())
                .on('data', (data) => {
                    results.push(data);

                    // Check the third column value
                    const columnValue = Object.values(data)[2];
                    if (routes.includes(columnValue)) {
                        newFilename = `${columnValue}-${uuidv4()}.csv`;
                    }
                })
                .on('end', () => {
                    if (newFilename !== file.originalname) {
                        const newFilePath = path.join('/tmp', newFilename);
                        fs.renameSync(tempFilePath, newFilePath);
                    } else {
                        newFilename = file.originalname;
                    }
                    allResults.push({ filename: newFilename, data: results });
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

/// Serve the CSV file
app.get('/tmp/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('/tmp/', filename);

    console.log(`Request to download file: ${filePath}`);

    // Set appropriate response headers
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'text/csv'); // Adjust content type if needed

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
        console.error('Error reading file:', error);
        res.status(500).send('Failed to read file');
    });
    fileStream.pipe(res);

    // Optionally, delete the file after sending it
    fileStream.on('close', () => {
        console.log(`File sent successfully, deleting: ${filePath}`);
        fs.unlinkSync(filePath);
    });
});

module.exports.handler = serverless(app);
