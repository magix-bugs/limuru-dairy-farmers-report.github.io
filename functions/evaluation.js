const fs = require('fs');
const csv = require('csv-parser');

const calculateTotalFromCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        let total = 0;

        if (!fs.existsSync(filePath)) {
            return reject(new Error(`File does not exist: ${filePath}`));
        }

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.quantity) {
                    const quantity = parseFloat(row.quantity);
                    if (!isNaN(quantity)) {
                        total += quantity;
                    } else {
                        console.warn(`Invalid quantity value: ${row.quantity} in file ${filePath}`);
                    }
                } else {
                    console.warn(`Missing 'quantity' field in row: ${JSON.stringify(row)} in file ${filePath}`);
                }
            })
            .on('end', () => {
                resolve(total);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

const evaluateQuantities = async (route, dir) => {
    try {
        const files = fs.readdirSync(dir).filter(file => file.includes(route));
        if (files.length === 0) {
            console.warn(`No files found for route: ${route}`);
            return {};
        }

        const evaluations = {};

        for (const file of files) {
            const filePath = `${dir}/${file}`;
            try {
                const total = await calculateTotalFromCSV(filePath);
                evaluations[file] = total;
            } catch (error) {
                console.error(`Error processing file ${filePath}:`, error);
            }
        }

        return evaluations;
    } catch (error) {
        console.error('Error evaluating quantities:', error);
        throw error;  // Rethrow the error after logging it
    }
};

module.exports = { evaluateQuantities };
