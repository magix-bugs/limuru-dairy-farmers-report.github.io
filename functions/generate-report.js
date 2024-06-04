import './routing';
import './sorting';
import './dateCategorization';
import './evaluation';
import './defaulters';

const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { categorizeFilesByPeriod } = require('./dateCategorization');
const { sortFilesByCategories, categories } = require('./sorting');
const { evaluateQuantities } = require('./evaluation');
const { findDefaultersByPeriod } = require('./defaulters');
const { determineRoutesFromFiles } = require('./routing');

const app = express();
const upload = multer({ dest: '/tmp' });

app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const filePaths = req.files.map(file => file.path);

    // Determine routes
    const routes = await determineRoutesFromFiles(filePaths);

    // Generate URLs for actions
    const routeData = routes.map(route => {
      return {
        route,
        actions: {
          sort: `/sort/${route}`,
          categorize: `/categorize/${route}`,
          evaluate: `/evaluate/${route}`,
          defaulters: `/defaulters/${route}`
        }
      };
    });

    // Clean up uploaded files
    req.files.forEach(file => fs.unlinkSync(file.path));

    res.json({ routes: routeData });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ error: 'Error processing files' });
  }
});

module.exports.handler = serverless(app);
