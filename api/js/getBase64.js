const fs = require("fs")

const getImageAsBase64 = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const base64 = data.toString('base64');
            resolve(base64);
        });
    });
};

module.exports = getImageAsBase64