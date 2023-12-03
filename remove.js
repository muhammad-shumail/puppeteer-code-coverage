const fs = require('fs');

// Read the coverage.json file
const rawData = fs.readFileSync('coverage.json');
const coverageData = JSON.parse(rawData);

// Assuming coverageData has a structure like { usedStyles: [...], unusedStyles: [...] }
const usedStyles = coverageData.usedStyles;

// Create a new CSS file with the used styles
console.log('foile name: ' + coverageData);
