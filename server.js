const express = require('express');
const app = express();
const generateReportHandler = require('./netlify/functions/generate-report');

app.use('./netlify/functions/generate-report', generateReportHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
