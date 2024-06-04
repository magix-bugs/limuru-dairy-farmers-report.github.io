// routing.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const routes = [
    'R001', 'R002', 'R003', 'R004', 'R005', 'R006', 'R007', 'R008', 'R009', 'R010',
    'R011', 'R012', 'R013', 'R014', 'R015', 'R016', 'R017', 'R018', 'R019', 'R020',
    'R021', 'R022', 'R023', 'R024', 'R025', 'R026', 'R027', 'R028', 'R030', 'R031',
    'R032', 'R033', 'R033A', 'R034', 'R035', 'R036', 'R037', 'R038', 'R039', 'R040',
    'R041', 'R042', 'Zone001'
];

const determineRoutesFromFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const determinedRoutes = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                for (const value of Object.values(row)) {
                    if (routes.includes(value)) {
                        determinedRoutes.push(value);
                    }
                }
            })
            .on('end', () => {
                resolve(determinedRoutes);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

const determineRoutesFromFiles = async (filePaths) => {
    const allRoutes = [];

    for (const filePath of filePaths) {
        try {
            const routesFromFile = await determineRoutesFromFile(filePath);
            allRoutes.push(...routesFromFile);
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    }

    return allRoutes;
};

module.exports = { determineRoutesFromFile, determineRoutesFromFiles };
