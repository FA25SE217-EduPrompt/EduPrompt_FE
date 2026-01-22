/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const https = require('https');

const file = fs.createWriteStream("schema.json");
https.get("https://eduprompt.up.railway.app/BE/v3/api-docs", response => {
    response.pipe(file);
    file.on('finish', () => {
        file.close(() => {
            console.log("Download completed");
        });
    });
}).on('error', err => {
    fs.unlink("schema.json");
    console.error("Error downloading:", err.message);
});
