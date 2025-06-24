const fs = require('fs');
const { cleanRosterText } = require('./roster-cleaner.js');

const cases = [
    {
        input: 'sample-roster-gw-da.txt',
        output: 'sample-cleaned-gw-da.txt',
        showPoints: true,
        smartFormat: true
    },
    {
        input: 'sample-roster-gw-da.txt',
        output: 'sample-cleaned-gw-da-no-points.txt',
        showPoints: false,
        smartFormat: true
    },
    {
        input: 'sample-roster-gw-da.txt',
        output: 'sample-cleaned-gw-da-no-smart.txt',
        showPoints: true,
        smartFormat: false
    },
    {
        input: 'sample-roster-gw-da.txt',
        output: 'sample-cleaned-gw-da-no-points-no-smart.txt',
        showPoints: false,
        smartFormat: false
    },
    {
        input: 'sample-roster-gw-tau.txt',
        output: 'sample-cleaned-gw-tau.txt',
        showPoints: true,
        smartFormat: true
    },
    {
        input: 'sample-roster-gw-tau.txt',
        output: 'sample-cleaned-gw-tau-no-points.txt',
        showPoints: false,
        smartFormat: true
    },
    {
        input: 'sample-roster-gw-tau.txt',
        output: 'sample-cleaned-gw-tau-no-smart.txt',
        showPoints: true,
        smartFormat: false
    },
    {
        input: 'sample-roster-gw-tau.txt',
        output: 'sample-cleaned-gw-tau-no-points-no-smart.txt',
        showPoints: false,
        smartFormat: false
    },
    {
        input: 'sample-roster-gw-csm.txt',
        output: 'sample-cleaned-gw-csm.txt',
        showPoints: true,
        smartFormat: true
    },
    {
        input: 'sample-roster-gw-csm.txt',
        output: 'sample-cleaned-gw-csm-no-points.txt',
        showPoints: false,
        smartFormat: true
    },
    {
        input: 'sample-roster-gw-csm.txt',
        output: 'sample-cleaned-gw-csm-no-smart.txt',
        showPoints: true,
        smartFormat: false
    },
    {
        input: 'sample-roster-gw-csm.txt',
        output: 'sample-cleaned-gw-csm-no-points-no-smart.txt',
        showPoints: false,
        smartFormat: false
    }
];

cases.forEach(({ input, output, showPoints, smartFormat }) => {
    const inputPath = `fixtures/${input}`;
    const outputPath = `fixtures/${output}`;
    const roster = fs.readFileSync(inputPath, 'utf8');
    const cleaned = cleanRosterText({ input: roster, showPoints, smartFormat }).trim() + '\n';
    fs.writeFileSync(outputPath, cleaned, 'utf8');
    console.warn(`Wrote: ${outputPath}`);
});

console.warn('All expected output files have been regenerated.'); 