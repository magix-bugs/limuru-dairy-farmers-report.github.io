const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const router = express.Router();

// Use multer for file upload handling
const upload = multer({ dest: '/tmp' });

// Define the route for handling CSV file uploads
router.post('/upload-csv', upload.array('csvFiles', 40), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    // Array to hold results for all files
    const allResults = [];

    // Process each uploaded CSV file
    req.files.forEach((file, index) => {
        const results = [];
        const tempFilePath = path.join('/tmp', file.originalname);

        // Rename the uploaded file to the /tmp directory
        fs.renameSync(file.path, tempFilePath);

        // Parse the CSV from the temporary file
        fs.createReadStream(tempFilePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                // Add results for this file to the allResults array
                allResults.push({ filename: file.originalname, data: results });

                // Remove the temporary file after processing
                fs.unlinkSync(tempFilePath);

                // If all files have been processed, format and send response
                if (allResults.length === req.files.length) {
                    const csvContent = formatAsCSV(allResults);
                    res.header('Content-Type', 'text/csv');
                    res.status(200).send(csvContent);
                }
            });
    });
});

// Function to format report data as CSV content
function formatAsCSV(allResults) {
    let csvContent = '';

    // Add CSV headers
    const headers = Object.keys(allResults[0].data[0]).join(',');
    csvContent += `${headers}\n`;

    // Add data rows
    allResults.forEach(result => {
        result.data.forEach(row => {
            const values = Object.values(row).join(',');
            csvContent += `${values}\n`;
        });
    });

    return csvContent;
}

module.exports = router;
