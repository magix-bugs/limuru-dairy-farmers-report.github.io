const express = require('express');
const multer  = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload-csv', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process the uploaded CSV file
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // Perform file system operations or any other processing here
            
            // Respond with success message and parsed CSV data
            res.status(200).json({ message: 'File uploaded and processed successfully', data: results });
        });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
