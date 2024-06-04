// evaluation.js
const fs = require('fs');
const csv = require('csv-parser');

const calculateTotalFromCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        let total = 0;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Assuming quantity is in a column named 'quantity'
                if (row.quantity) {
                    total += parseFloat(row.quantity);
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
        const evaluations = {};

        for (const file of files) {
            const filePath = `${dir}/${file}`;
            const total = await calculateTotalFromCSV(filePath);
            evaluations[file] = total;
        }

        // Implement further evaluation logic if needed
        return evaluations;
    } catch (error) {
        console.error('Error evaluating quantities:', error);
    }
};

module.exports = { evaluateQuantities };
