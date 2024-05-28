const express = require('express');
const cors = require('cors');
const generateReportHandler = require('./functions/generate-report');

const app = express();

// Use CORS middleware if needed
app.use(cors());

// Route for handling generate-report function locally
app.use('/generate-report', generateReportHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
