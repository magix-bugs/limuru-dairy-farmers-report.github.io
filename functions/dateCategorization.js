// dateCategorization.js
const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment'); // Ensure moment.js is installed: npm install moment

const categorizeByDate = (filePath) => {
    return new Promise((resolve, reject) => {
        const dates = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                for (const value of Object.values(row)) {
                    if (moment(value, moment.ISO_8601, true).isValid()) {
                        dates.push(moment(value));
                    }
                }
            })
            .on('end', () => {
                resolve(dates);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

const categorizeFilesByPeriod = async (filePaths) => {
    const daily = {};
    const weekly = {};
    const monthly = {};

    for (const filePath of filePaths) {
        try {
            const dates = await categorizeByDate(filePath);
            dates.forEach(date => {
                const dayKey = date.format('YYYY-MM-DD');
                const weekKey = date.startOf('week').format('YYYY-MM-DD');
                const monthKey = date.startOf('month').format('YYYY-MM');

                if (!daily[dayKey]) {
                    daily[dayKey] = [];
                }
                if (!weekly[weekKey]) {
                    weekly[weekKey] = [];
                }
                if (!monthly[monthKey]) {
                    monthly[monthKey] = [];
                }

                daily[dayKey].push(filePath);
                weekly[weekKey].push(filePath);
                monthly[monthKey].push(filePath);
            });
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    }

    return { daily, weekly, monthly };
};

module.exports = { categorizeFilesByPeriod };
