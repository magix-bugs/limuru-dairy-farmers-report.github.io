// defaulters.js
const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment'); // Ensure moment.js is installed: npm install moment
const { categorizeFilesByPeriod } = require('./dateCategorization');
const { sortFilesByCategories } = require('./sorting');

const getMembersFromCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const members = new Set();

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Assuming member names are in a column named 'member'
                if (row.member) {
                    members.add(row.member);
                }
            })
            .on('end', () => {
                resolve(members);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

const findDefaulters = async (categorizedData, category, period, periodKeys) => {
    const defaulters = {};

    for (let i = 1; i < periodKeys.length; i++) {
        const prevPeriodKey = periodKeys[i - 1];
        const currentPeriodKey = periodKeys[i];

        const prevFiles = categorizedData[category][period][prevPeriodKey] || [];
        const currentFiles = categorizedData[category][period][currentPeriodKey] || [];

        const prevMembers = new Set();
        const currentMembers = new Set();

        for (const filePath of prevFiles) {
            const members = await getMembersFromCSV(filePath);
            members.forEach(member => prevMembers.add(member));
        }

        for (const filePath of currentFiles) {
            const members = await getMembersFromCSV(filePath);
            members.forEach(member => currentMembers.add(member));
        }

        prevMembers.forEach(member => {
            if (!currentMembers.has(member)) {
                if (!defaulters[member]) {
                    defaulters[member] = 0;
                }
                defaulters[member]++;
            }
        });
    }

    return defaulters;
};

const findDefaultersByPeriod = async (filePaths, categories, period) => {
    try {
        const categorizedData = await categorizeFilesByPeriod(filePaths);
        const sortedData = await sortFilesByCategories(categorizedData);

        const periodKeys = Object.keys(categorizedData).sort();

        const allDefaulters = {};
        for (const category of Object.keys(categories)) {
            const defaulters = await findDefaulters(categorizedData, category, period, periodKeys);
            allDefaulters[categories[category]] = defaulters;
        }

        return allDefaulters;
    } catch (error) {
        console.error('Error finding defaulters:', error);
    }
};

module.exports = { findDefaulters, findDefaultersByPeriod };
