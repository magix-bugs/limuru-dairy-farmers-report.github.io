// evaluation.js
const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment'); // Ensure moment.js is installed: npm install moment
const { categorizeFilesByPeriod } = require('./dateCategorization');

const sumMilkQuantities = async (categorizedData, period, periodKey) => {
    let totalQuantity = 0;

    if (categorizedData[period] && categorizedData[period][periodKey]) {
        const filePaths = categorizedData[period][periodKey];

        for (const filePath of filePaths) {
            totalQuantity += await calculateTotalFromCSV(filePath);
        }
    }

    return totalQuantity;
};

const calculateTotalFromCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        let totalQuantity = 0;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                for (const value of Object.values(row)) {
                    totalQuantity += parseFloat(value) || 0;
                }
            })
            .on('end', () => {
                resolve(totalQuantity);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

const differenceMilkQuantities = async (categorizedData, period, periodKey1, periodKey2) => {
    try {
        const quantity1 = await sumMilkQuantities(categorizedData, period, periodKey1);
        const quantity2 = await sumMilkQuantities(categorizedData, period, periodKey2);
        return quantity1 - quantity2;
    } catch (error) {
        throw new Error(`Error calculating difference: ${error.message}`);
    }
};

module.exports = { sumMilkQuantities, differenceMilkQuantities };
