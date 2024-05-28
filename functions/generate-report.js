const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer();

app.post('/upload-csv', upload.array('csvFiles', 40), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    // Array to hold results for all files
    const allResults = [];

    // Process each uploaded CSV file
    req.files.forEach((file, index) => {
        const results = [];
        const tempFilePath = path.join('/tmp', file.originalname); // Use original filename for temporary file

        // Move the uploaded file to the /tmp directory
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

                // If all files have been processed, send response
                if (allResults.length === req.files.length) {
                    res.status(200).json({ message: 'Files uploaded and processed successfully', data: allResults });
                }
            });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
