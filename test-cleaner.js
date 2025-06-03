const fs = require('fs');
const { cleanRosterText } = require('./app.js');

function runTest(sampleRosterPath, expectedOutputPath, factionName, showPoints = true, smartFormat = true) {
    console.log(`\nTesting ${factionName} roster (${showPoints ? 'with' : 'without'} points, ${smartFormat ? 'with' : 'without'} smart format):`);
    console.log('----------------------------------------');

    // Load the sample roster
    const sampleRoster = fs.readFileSync(sampleRosterPath, 'utf8');

    // Run the cleaner
    const actualOutput = cleanRosterText(sampleRoster, showPoints, smartFormat).trim();

    // Compare with expected output
    const expectedOutput = fs.readFileSync(expectedOutputPath, 'utf8').trim();

    console.log('Actual output:');
    console.log(actualOutput);
    console.log('\nExpected output:');
    console.log(expectedOutput);
    console.log('\nOutputs match:', actualOutput === expectedOutput);
    console.log('----------------------------------------');
}

// Run tests for both factions with points and smart format
runTest('fixtures/sample-roster-gw-da.txt', 'fixtures/sample-cleaned-gw-da.txt', 'Dark Angels', true, true);
runTest('fixtures/sample-roster-gw-tau.txt', 'fixtures/sample-cleaned-gw-tau.txt', 'Tau Empire', true, true);

// Run tests for both factions without points
runTest('fixtures/sample-roster-gw-da.txt', 'fixtures/sample-cleaned-gw-da-no-points.txt', 'Dark Angels', false, true);
runTest('fixtures/sample-roster-gw-tau.txt', 'fixtures/sample-cleaned-gw-tau-no-points.txt', 'Tau Empire', false, true);

// Run tests for both factions without smart format
runTest('fixtures/sample-roster-gw-da.txt', 'fixtures/sample-cleaned-gw-da-no-smart.txt', 'Dark Angels', true, false);
runTest('fixtures/sample-roster-gw-tau.txt', 'fixtures/sample-cleaned-gw-tau-no-smart.txt', 'Tau Empire', true, false); 