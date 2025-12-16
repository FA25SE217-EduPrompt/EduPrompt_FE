/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = 'src/messages/en.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(data);
    console.log('Top level keys:', Object.keys(json));
} catch (e) {
    console.log('JSON error:', e.message);
}
