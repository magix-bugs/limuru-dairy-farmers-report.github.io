const express = require('express');
const cors = require('cors');
const app = express();
const generateReportHandler = require('./functions/generate-report');

// Use CORS middleware if needed
app.use(cors());

// Use the correct path for the Netlify endpoint
app.use('/.netlify/functions/generate-report', generateReportHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
