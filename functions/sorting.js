// sorting.js
const fs = require('fs');
const csv = require('csv-parser');

const categories = {
    am: ['am'], // replace with actual values for 'am'
    pm: ['pm'], // replace with actual values for 'pm'
    pm2: ['pm2'], // replace with actual values for 'pm2'
};

const sortFiles = (filePath) => {
    return new Promise((resolve, reject) => {
        const sortedData = { am: [], pm: [], pm2: [] };

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                for (const [category, values] of Object.entries(categories)) {
                    for (const value of Object.values(row)) {
                        if (values.includes(value)) {
                            sortedData[category].push(value);
                        }
                    }
                }
            })
            .on('end', () => {
                resolve(sortedData);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

const sortFilesFromMultiplePaths = async (filePaths) => {
    const aggregatedData = { am: [], pm: [], pm2: [] };

    for (const filePath of filePaths) {
        try {
            const sortedData = await sortFiles(filePath);
            aggregatedData.am.push(...sortedData.am);
            aggregatedData.pm.push(...sortedData.pm);
            aggregatedData.pm2.push(...sortedData.pm2);
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    }

    return aggregatedData;
};

module.exports = { sortFiles, sortFilesFromMultiplePaths, categories };
