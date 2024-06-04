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
const { sortFilesFromMultiplePaths, sortFiles, categories } = require('./sorting');
const { evaluateQuantities } = require('./evaluation');
const { findDefaulters, findDefaultersByPeriod } = require('./defaulters');
const { determineRoutesFromFiles } = require('./routing');

const app = express();
const upload = multer({ dest: '/tmp' });

app.post('/upload', upload.array('files'), async (req, res) => {
  console.log('Files received:', req.files);
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

    res.json({ routes: routeData });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ error: 'Error processing files' });
  }
});

app.get('/sort/:route', async (req, res) => {
  const route = req.params.route;
  const sortedFiles = await sortFilesFromMultiplePaths([`${route}`]);
  res.json({ message: `Files sorted for route ${route}`, sortedFiles });
});

app.get('/categorize/:route', (req, res) => {
  const route = req.params.route;
  const categorizedFiles = categorizeFilesByPeriod(route, './tmp');
  res.json({ message: `Files categorized for route ${route}`, categorizedFiles });
});

app.get('/evaluate/:route', async (req, res) => {
  const route = req.params.route;
  const evaluations = await evaluateQuantities(route, './tmp');
  res.json({ message: `Quantities evaluated for route ${route}`, evaluations });
});

app.get('/defaulters/:route', async (req, res) => {
  const route = req.params.route;
  const defaulters = await findDefaultersByPeriod(route, findDefaulters, categorizeFilesByPeriod, sortFilesFromMultiplePaths, './tmp');
  res.json({ message: `Defaulters identified for route ${route}`, defaulters });
});

module.exports.handler = serverless(app);
