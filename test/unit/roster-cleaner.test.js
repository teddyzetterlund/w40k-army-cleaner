import fs from 'fs';
import { cleanRosterText } from '../../roster-cleaner.js';
import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/dom';

// Helper function to read test fixtures
const readFixture = (filename) => {
    return fs.readFileSync(`fixtures/${filename}`, 'utf8').trim();
};

describe('Roster Cleaner', () => {
// Test Chaos Space Marines roster
    describe('Chaos Space Marines Roster', () => {
        const input = readFixture('sample-roster-gw-csm.txt');

        test('cleans roster with points and smart format', () => {
            const expected = readFixture('sample-cleaned-gw-csm.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans roster without points', () => {
            const expected = readFixture('sample-cleaned-gw-csm-no-points.txt');
            const result = cleanRosterText({ input, showPoints: false, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans roster without smart format', () => {
            const expected = readFixture('sample-cleaned-gw-csm-no-smart.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: false });
            expect(result).toBe(expected);
        });

        test('cleans roster without points and smart format', () => {
            const expected = readFixture('sample-cleaned-gw-csm-no-points-no-smart.txt');
            const result = cleanRosterText({ input, showPoints: false, smartFormat: false });
            expect(result).toBe(expected);
        });
    });

    // Test Dark Angels roster
    describe('Dark Angels Roster', () => {
        const input = readFixture('sample-roster-gw-da.txt');
        
        test('cleans roster with points and smart format', () => {
            const expected = readFixture('sample-cleaned-gw-da.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans roster without points', () => {
            const expected = readFixture('sample-cleaned-gw-da-no-points.txt');
            const result = cleanRosterText({ input, showPoints: false, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans roster without smart format', () => {
            const expected = readFixture('sample-cleaned-gw-da-no-smart.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: false });
            expect(result).toBe(expected);
        });

        test('cleans roster without points and smart format', () => {
            const expected = readFixture('sample-cleaned-gw-da-no-points-no-smart.txt');
            const result = cleanRosterText({ input, showPoints: false, smartFormat: false });
            expect(result).toBe(expected);
        });
    });

    // Test Tau Empire roster
    describe('Tau Empire Roster', () => {
        const input = readFixture('sample-roster-gw-tau.txt');
        
        test('cleans roster with points and smart format', () => {
            const expected = readFixture('sample-cleaned-gw-tau.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans roster without points', () => {
            const expected = readFixture('sample-cleaned-gw-tau-no-points.txt');
            const result = cleanRosterText({ input, showPoints: false, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans roster without smart format', () => {
            const expected = readFixture('sample-cleaned-gw-tau-no-smart.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: false });
            expect(result).toBe(expected);
        });

        test('cleans roster without points and smart format', () => {
            const expected = readFixture('sample-cleaned-gw-tau-no-points-no-smart.txt');
            const result = cleanRosterText({ input, showPoints: false, smartFormat: false });
            expect(result).toBe(expected);
        });
    });

    // Test edge cases
    describe('Edge Cases', () => {
        test('handles empty input', () => {
            expect(cleanRosterText({ input: '' })).toBe('');
        });

        test('handles whitespace only input', () => {
            expect(cleanRosterText({ input: '   \n   \t   ' })).toBe('');
        });

        test('handles input with only header', () => {
            const input = 'The Hunt Never Ended (2000 Points)\n\nSpace Marines\nDark Angels';
            const result = cleanRosterText({ input });
            expect(result).toContain('The Hunt Never Ended (2000 Points)');
            expect(result).toContain('SM - Dark Angels');
        });
    });

    // Test consolidate duplicates feature
    describe('Consolidate Duplicates', () => {
        test('consolidates consecutive duplicate lines in cleaned output', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                consolidateDuplicates: true 
            });

            // Should consolidate the duplicate entries
            expect(result).toContain('2 Legionaries (90)');
            expect(result).toContain('2 Predator Annihilator (135)');
            expect(result).toContain('2 Vindicator (185)');
            expect(result).toContain('2 Possessed (240)');
            
            // Should not have the individual duplicate entries
            const lines = result.split('\n');
            const legionariesLines = lines.filter(line => line.includes('Legionaries (90)'));
            expect(legionariesLines).toHaveLength(1);
            expect(legionariesLines[0]).toBe('2 Legionaries (90)');
        });

        test('does not consolidate duplicates when option is disabled', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                consolidateDuplicates: false 
            });

            // Should have individual duplicate entries
            const lines = result.split('\n');
            const legionariesLines = lines.filter(line => line.includes('Legionaries (90)'));
            expect(legionariesLines).toHaveLength(2);
            expect(legionariesLines[0]).toBe('Legionaries (90)');
            expect(legionariesLines[1]).toBe('Legionaries (90)');
        });

        test('consolidates duplicates without points', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: false, 
                smartFormat: true, 
                consolidateDuplicates: true 
            });

            expect(result).toContain('2 Legionaries');
            expect(result).not.toContain('(90)');
        });

        test('handles non-consecutive duplicates correctly', () => {
            const input = readFixture('sample-roster-gw-da.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                consolidateDuplicates: true 
            });

            // Should consolidate consecutive duplicates
            expect(result).toContain('2 Assault Intercessors (75)');
            expect(result).toContain('2 Deathwing Knights (250)');
            expect(result).toContain('2 Deathwing Terminators (180)');
            
            // Should not consolidate non-consecutive duplicates (if any)
            const lines = result.split('\n');
            const intercessorsLines = lines.filter(line => line.includes('Intercessors'));
            // Should have both "2 Assault Intercessors" and "Intercessors" (non-consecutive)
            expect(intercessorsLines.length).toBeGreaterThanOrEqual(2);
        });
    });
}); 