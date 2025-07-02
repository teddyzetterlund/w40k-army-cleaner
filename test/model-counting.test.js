import { cleanRosterText } from '../roster-cleaner.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Normalizes text by removing extra whitespace and empty lines
 * @param {string} text - The text to normalize
 * @returns {string} The normalized text
 */
function normalizeText(text) {
    return text
        .split('\n')
        .map(line => line.replace(/\s+/g, ' ').trim())
        .filter(line => line.length > 0)
        .join('\n');
}

describe('Model Counting', () => {
    let csmRoster;
    let csmExpected;
    let daRoster;
    let daExpected;
    let tauRoster;
    let tauExpected;

    beforeAll(() => {
        csmRoster = readFileSync(join(__dirname, '../fixtures/sample-roster-gw-csm.txt'), 'utf8');
        csmExpected = readFileSync(join(__dirname, '../fixtures/sample-cleaned-gw-csm-with-models.txt'), 'utf8');
        daRoster = readFileSync(join(__dirname, '../fixtures/sample-roster-gw-da.txt'), 'utf8');
        daExpected = readFileSync(join(__dirname, '../fixtures/sample-cleaned-gw-da-with-models.txt'), 'utf8');
        tauRoster = readFileSync(join(__dirname, '../fixtures/sample-roster-gw-tau.txt'), 'utf8');
        tauExpected = readFileSync(join(__dirname, '../fixtures/sample-cleaned-gw-tau-with-models.txt'), 'utf8');
    });

    describe('Chaos Space Marines', () => {
        test('should correctly count models in CSM roster', () => {
            const result = cleanRosterText({ input: csmRoster, showPoints: true, smartFormat: true, showModels: true });
            expect(normalizeText(result)).toBe(normalizeText(csmExpected));
        });

        test('should not show model counts when showModels is false', () => {
            const result = cleanRosterText({ input: csmRoster, showPoints: true, smartFormat: true, showModels: false });
            const expected = readFileSync(join(__dirname, '../fixtures/sample-cleaned-gw-csm.txt'), 'utf8');
            expect(normalizeText(result)).toBe(normalizeText(expected));
        });

        test('should handle single-model units correctly', () => {
            const singleModelUnits = [
                'Lord in Terminator Armour (105)',
                'Sorcerer in Terminator Armour (100)',
                'Rhino (75)',
                'Predator Annihilator (135)',
                'Vindicator (185)'
            ];

            const result = cleanRosterText({ input: csmRoster, showPoints: true, smartFormat: true, showModels: true });
            singleModelUnits.forEach(unit => {
                expect(result).not.toContain(`1x ${unit}`);
                expect(result).toContain(unit);
            });
        });

        test('should handle multi-model units correctly', () => {
            const multiModelUnits = [
                '10x Cultists (50)',
                '5x Legionaries (90)',
                '10x Terminators (360)',
                '10x Possessed (240)'
            ];

            const result = cleanRosterText({ input: csmRoster, showPoints: true, smartFormat: true, showModels: true });
            multiModelUnits.forEach(unit => {
                expect(result).toContain(unit);
            });
        });

        test('should preserve enhancements when showing model counts', () => {
            const result = cleanRosterText({ input: csmRoster, showPoints: true, smartFormat: true, showModels: true });
            expect(result).toContain('Lord in Terminator Armour (105)\n  • Enhancement: Bastion Plate');
            expect(result).toContain('Sorcerer in Terminator Armour (100)\n  • Enhancement: Warp Tracer');
        });
    });

    describe('Space Marines (Dark Angels)', () => {
        test('should correctly count models in DA roster', () => {
            const result = cleanRosterText({ input: daRoster, showPoints: true, smartFormat: true, showModels: true });
            expect(normalizeText(result)).toBe(normalizeText(daExpected));
        });

        test('should not show model counts when showModels is false', () => {
            const result = cleanRosterText({ input: daRoster, showPoints: true, smartFormat: true, showModels: false });
            const expected = readFileSync(join(__dirname, '../fixtures/sample-cleaned-gw-da.txt'), 'utf8');
            expect(normalizeText(result)).toBe(normalizeText(expected));
        });

        test('should handle single-model units correctly', () => {
            const singleModelUnits = [
                'Azrael (115)',
                'Captain in Terminator Armour (110)',
                'Chaplain in Terminator Armour (75)',
                'Lieutenant with Combi-weapon (70)',
                'Land Raider (240)'
            ];
            const result = cleanRosterText({ input: daRoster, showPoints: true, smartFormat: true, showModels: true });
            singleModelUnits.forEach(unit => {
                expect(result).not.toContain(`1x ${unit}`);
                expect(result).toContain(unit);
            });
        });

        test('should handle multi-model units correctly', () => {
            const multiModelUnits = [
                '5x Assault Intercessors (75)',
                '5x Intercessors (80)',
                '5x Deathwing Knights (250)',
                '10x Hellblasters (230)',
                '5x Scouts (70)'
            ];
            const result = cleanRosterText({ input: daRoster, showPoints: true, smartFormat: true, showModels: true });
            multiModelUnits.forEach(unit => {
                expect(result).toContain(unit);
            });
        });
    });

    describe('T\'au Empire', () => {
        test('should correctly count models in T\'au roster', () => {
            const result = cleanRosterText({ input: tauRoster, showPoints: true, smartFormat: true, showModels: true });
            expect(normalizeText(result)).toBe(normalizeText(tauExpected));
        });

        test('should correctly count Strike Team models', () => {
            const result = cleanRosterText({ input: tauRoster, showPoints: true, smartFormat: true, showModels: true });
            // Strike Team should have 10 models (1 Shas'ui + 9 Fire Warriors)
            expect(result).toContain('10x Strike Team (75)');
        });

        test('should not count equipment as models', () => {
            const result = cleanRosterText({ input: tauRoster, showPoints: true, smartFormat: true, showModels: true });
            // Support turret should not be counted as a model
            expect(result).not.toContain('11x Strike Team');
        });

        test('should handle single-model units correctly', () => {
            const singleModelUnits = [
                'Farsight (105)',
                'Coldstar (95)',
                'Enforcer (100)',
                'Ghostkeel (160)',
                'Krootox Riders (35)',
                'Riptide (180)'
            ];
            const result = cleanRosterText({ input: tauRoster, showPoints: true, smartFormat: true, showModels: true });
            singleModelUnits.forEach(unit => {
                expect(result).not.toContain(`1x ${unit}`);
                expect(result).toContain(unit);
            });
        });

        test('should handle multi-model units correctly', () => {
            const multiModelUnits = [
                '10x Strike Team (75)',
                '2x Broadsides (180)',
                '3x Crisis Fireknifes (130)',
                '3x Crisis Starscythes (110)',
                '3x Stealths (60)'
            ];
            const result = cleanRosterText({ input: tauRoster, showPoints: true, smartFormat: true, showModels: true });
            multiModelUnits.forEach(unit => {
                expect(result).toContain(unit);
            });
        });
    });
}); 