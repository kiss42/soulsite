const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Adjusted path to the JSON file
const angelNumbers = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'angelNumbers.json'), 'utf8'));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt user to enter an angel number
rl.question('Enter an angel number: ', function (number) {
    const result = angelNumbers[number];
    if (result) {
        console.log(`Angel Number ${number}: ${result}`);
    } else {
        console.log(`Angel Number ${number} not found. Please try another number.`);
    }
    rl.close();
});

rl.on('close', function () {
    process.exit(0);
});
