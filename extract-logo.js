const fs = require('fs');
const base64 = 'PASTE_BASE64_STRING_HERE';
fs.writeFileSync('logo.png', Buffer.from(base64, 'base64'));
console.log('logo.png written');
