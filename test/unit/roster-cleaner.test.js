import fs from 'fs';
import {
  cleanRosterText,
  consolidateDuplicateLines,
  inlineEnhancementLines,
  convertToOneLiner,
  countModelsInNewRecruitUnit
} from '../../roster-cleaner.js';
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

    // Test one-liner feature
    describe('One-Liner Output', () => {
        test('converts cleaned roster to single line with comma separators', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                oneLiner: true 
            });

            // Should be a single line with commas
            const lines = result.split('\n');
            expect(lines).toHaveLength(1);
            
            // Should contain commas separating units
            expect(result).toContain(',');
            // Should have inline enhancements since one-liner forces it
            expect(result).toContain('Lord in Terminator Armour [Bastion Plate] (105)');
            expect(result).toContain('Sorcerer in Terminator Armour [Warp Tracer] (100)');
            expect(result).toContain('Cultists (50)');
        });

        test('does not convert to one-liner when option is disabled', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                oneLiner: false 
            });

            // Should have multiple lines
            const lines = result.split('\n');
            expect(lines.length).toBeGreaterThan(1);
            
            // Should not contain commas as separators between units
            // (but may contain commas in unit names or enhancements)
            // We'll check that there is no single line with many commas
            expect(lines.some(line => line.split(',').length > 2)).toBe(false);
        });

        test('works with consolidate duplicates option', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                consolidateDuplicates: true,
                oneLiner: true 
            });

            // Should be a single line
            const lines = result.split('\n');
            expect(lines).toHaveLength(1);
            
            // Should contain consolidated duplicates
            expect(result).toContain('2 Legionaries (90)');
            expect(result).toContain('2 Predator Annihilator (135)');
            expect(result).toContain('2 Vindicator (185)');
            expect(result).toContain('2 Possessed (240)');
            
            // Should contain commas
            expect(result).toContain(',');
        });

        test('works without points', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: false, 
                smartFormat: true, 
                oneLiner: true 
            });

            // Should be a single line
            const lines = result.split('\n');
            expect(lines).toHaveLength(1);
            
            // Should not contain points
            expect(result).not.toContain('(105)');
            expect(result).not.toContain('(100)');
            expect(result).not.toContain('(50)');
            
            // Should contain unit names
            expect(result).toContain('Lord in Terminator Armour');
            expect(result).toContain('Sorcerer in Terminator Armour');
            expect(result).toContain('Cultists');
        });

        test('handles empty roster correctly', () => {
            const result = cleanRosterText({ 
                input: '', 
                oneLiner: true 
            });

            expect(result).toBe('');
        });
    });

    // Test inline enhancements feature
    describe('Inline Enhancements', () => {
        test('moves enhancement lines into square brackets with unit name', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                inlineEnhancements: true 
            });

            // Should have enhancements in square brackets
            expect(result).toContain('Lord in Terminator Armour [Bastion Plate] (105)');
            expect(result).toContain('Sorcerer in Terminator Armour [Warp Tracer] (100)');
            
            // Should not have separate enhancement lines
            expect(result).not.toContain('  • Enhancement: Bastion Plate');
            expect(result).not.toContain('  • Enhancement: Warp Tracer');
        });

        test('does not inline enhancements when option is disabled', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                inlineEnhancements: false 
            });

            // Should have separate enhancement lines
            expect(result).toContain('Lord in Terminator Armour (105)');
            expect(result).toContain('  • Enhancement: Bastion Plate');
            expect(result).toContain('Sorcerer in Terminator Armour (100)');
            expect(result).toContain('  • Enhancement: Warp Tracer');
            
            // Should not have enhancements in square brackets
            expect(result).not.toContain('[Bastion Plate]');
            expect(result).not.toContain('[Warp Tracer]');
        });

        test('works without points', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: false, 
                smartFormat: true, 
                inlineEnhancements: true 
            });

            // Should have enhancements in square brackets without points
            expect(result).toContain('Lord in Terminator Armour [Bastion Plate]');
            expect(result).toContain('Sorcerer in Terminator Armour [Warp Tracer]');
            expect(result).not.toContain('(105)');
            expect(result).not.toContain('(100)');
        });

        test('works with one-liner option', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                inlineEnhancements: true,
                oneLiner: true 
            });

            // Should be a single line with inline enhancements
            const lines = result.split('\n');
            expect(lines).toHaveLength(1);
            
            // Should contain inline enhancements
            expect(result).toContain('Lord in Terminator Armour [Bastion Plate] (105)');
            expect(result).toContain('Sorcerer in Terminator Armour [Warp Tracer] (100)');
            
            // Should contain commas
            expect(result).toContain(',');
        });

        test('one-liner forces inline enhancements to be enabled', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                inlineEnhancements: false, // Explicitly disabled
                oneLiner: true 
            });

            // Should still have inline enhancements because one-liner forces it
            expect(result).toContain('Lord in Terminator Armour [Bastion Plate] (105)');
            expect(result).toContain('Sorcerer in Terminator Armour [Warp Tracer] (100)');
            expect(result).not.toContain('  • Enhancement:');
        });

        test('handles units without enhancements correctly', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                inlineEnhancements: true 
            });

            // Units without enhancements should remain unchanged
            expect(result).toContain('Cultists (50)');
            expect(result).toContain('Legionaries (90)');
            expect(result).toContain('Rhino (75)');
            
            // Should not have empty square brackets
            expect(result).not.toContain('[]');
        });
    });

    // Test hide header feature
    describe('Hide Header', () => {
        test('removes army header information when showHeader is false', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                showHeader: false 
            });

            // Should not contain the army header information
            expect(result).not.toContain('The Goal is to Survive the Shooting Phase');
            expect(result).not.toContain('Chaos Space Marines');
            expect(result).not.toContain('Strike Force');
            expect(result).not.toContain('Fellhammer Siege-host');
            
            // Should start directly with units
            expect(result.trim()).toMatch(/^Lord in Terminator Armour/);
        });

        test('includes army header information when showHeader is true', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                showHeader: true 
            });

            // Should contain the army header information
            expect(result).toContain('The Goal is to Survive the Shooting Phase  (1990 points)');
            expect(result).toContain('Chaos Space Marines - Fellhammer Siege-host');
        });

        test('works without points', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: false, 
                smartFormat: true, 
                showHeader: false 
            });

            // Should not contain the army header information
            expect(result).not.toContain('The Goal is to Survive the Shooting Phase');
            expect(result).not.toContain('Chaos Space Marines');
            expect(result).not.toContain('Strike Force');
            expect(result).not.toContain('Fellhammer Siege-host');
            
            // Should start directly with units without points
            expect(result.trim()).toMatch(/^Lord in Terminator Armour/);
            expect(result).not.toContain('(105)');
        });

        test('works with one-liner option', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                showHeader: false,
                oneLiner: true 
            });

            // Should be a single line without header
            const lines = result.split('\n');
            expect(lines).toHaveLength(1);
            
            // Should not contain header information
            expect(result).not.toContain('The Goal is to Survive the Shooting Phase');
            expect(result).not.toContain('Chaos Space Marines');
            
            // Should contain unit names
            expect(result).toContain('Lord in Terminator Armour');
            expect(result).toContain('Sorcerer in Terminator Armour');
        });

        test('works with consolidate duplicates option', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                showHeader: false,
                consolidateDuplicates: true 
            });

            // Should not contain header information
            expect(result).not.toContain('The Goal is to Survive the Shooting Phase');
            expect(result).not.toContain('Chaos Space Marines');
            
            // Should contain consolidated duplicates
            expect(result).toContain('2 Legionaries (90)');
            expect(result).toContain('2 Predator Annihilator (135)');
        });

        test('handles empty roster correctly', () => {
            const result = cleanRosterText({ 
                input: '', 
                showHeader: false 
            });

            expect(result).toBe('');
        });
    });

    // Test no empty lines feature
    describe('No Empty Lines', () => {
        test('removes empty lines when noEmptyLines is enabled', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                noEmptyLines: true 
            });

            // Should not contain consecutive empty lines
            expect(result).not.toContain('\n\n\n');
            
            // Should not contain empty lines between units
            expect(result).not.toMatch(/Lord in Terminator Armour.*\n\n.*Sorcerer in Terminator Armour/);
            expect(result).not.toMatch(/Sorcerer in Terminator Armour.*\n\n.*Cultists/);
            
            // Should still contain unit names
            expect(result).toContain('Lord in Terminator Armour (105)');
            expect(result).toContain('Sorcerer in Terminator Armour (100)');
            expect(result).toContain('Cultists (50)');
        });

        test('keeps empty lines when noEmptyLines is disabled', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                noEmptyLines: false 
            });

            // Should contain empty lines between units (normal format)
            expect(result).toMatch(/Lord in Terminator Armour.*\n  • Enhancement: Bastion Plate\n\n.*Sorcerer in Terminator Armour/);
            expect(result).toMatch(/Sorcerer in Terminator Armour.*\n  • Enhancement: Warp Tracer\n\n.*Cultists/);
        });

        test('works without points', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: false, 
                smartFormat: true, 
                noEmptyLines: true 
            });

            // Should not contain empty lines
            expect(result).not.toContain('\n\n\n');
            
            // Should not contain points
            expect(result).not.toContain('(105)');
            expect(result).not.toContain('(100)');
            expect(result).not.toContain('(50)');
            
            // Should contain unit names without empty lines between them
            expect(result).toContain('Lord in Terminator Armour');
            expect(result).toContain('Sorcerer in Terminator Armour');
            expect(result).toContain('Cultists');
        });

        test('works with one-liner option', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                noEmptyLines: true,
                oneLiner: true 
            });

            // Should be a single line (one-liner overrides no empty lines)
            const lines = result.split('\n');
            expect(lines).toHaveLength(1);
            
            // Should contain unit names
            expect(result).toContain('Lord in Terminator Armour');
            expect(result).toContain('Sorcerer in Terminator Armour');
            expect(result).toContain('Cultists');
        });

        test('works with consolidate duplicates option', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                noEmptyLines: true,
                consolidateDuplicates: true 
            });

            // Should not contain empty lines
            expect(result).not.toContain('\n\n\n');
            
            // Should contain consolidated duplicates
            expect(result).toContain('2 Legionaries (90)');
            expect(result).toContain('2 Predator Annihilator (135)');
            expect(result).toContain('2 Vindicator (185)');
            expect(result).toContain('2 Possessed (240)');
        });

        test('works with showHeader option', () => {
            const input = readFixture('sample-roster-gw-csm.txt');
            
            const result = cleanRosterText({ 
                input, 
                showPoints: true, 
                smartFormat: true, 
                noEmptyLines: true,
                showHeader: false 
            });

            // Should not contain empty lines
            expect(result).not.toContain('\n\n\n');
            
            // Should not contain header information
            expect(result).not.toContain('The Goal is to Survive the Shooting Phase');
            expect(result).not.toContain('Chaos Space Marines');
            
            // Should start directly with units
            expect(result.trim()).toMatch(/^Lord in Terminator Armour/);
        });

        test('handles empty roster correctly', () => {
            const result = cleanRosterText({ 
                input: '', 
                noEmptyLines: true 
            });

            expect(result).toBe('');
        });
    });

    // Test NewRecruit format roster
    describe('NewRecruit Format Roster', () => {
        const input = readFixture('sample-roster-nr-csm.txt');
        
        test('cleans NewRecruit roster with points and smart format', () => {
            const expected = readFixture('sample-cleaned-nr-csm.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans NewRecruit roster without points', () => {
            const expected = readFixture('sample-cleaned-nr-csm-no-points.txt');
            const result = cleanRosterText({ input, showPoints: false, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans NewRecruit roster without smart format', () => {
            const expected = readFixture('sample-cleaned-nr-csm-no-smart.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: false });
            expect(result).toBe(expected);
        });

        test('cleans NewRecruit roster without points and smart format', () => {
            const expected = readFixture('sample-cleaned-nr-csm-no-points-no-smart.txt');
            const result = cleanRosterText({ input, showPoints: false, smartFormat: false });
            expect(result).toBe(expected);
        });
    });

    // Test NewRecruit WTC-compact format roster
    describe('NewRecruit WTC-Compact Format Roster', () => {
        const input = readFixture('sample-roster-nr-necrons-wtc-compact.txt');
        
        test('cleans NewRecruit WTC-compact roster with points and smart format', () => {
            const expected = readFixture('sample-cleaned-nr-necrons-wtc-compact.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans NewRecruit WTC-compact roster without points', () => {
            const expected = readFixture('sample-cleaned-nr-necrons-wtc-compact-no-points.txt');
            const result = cleanRosterText({ input, showPoints: false, smartFormat: true });
            expect(result).toBe(expected);
        });

        test('cleans NewRecruit WTC-compact roster without smart format', () => {
            const result = cleanRosterText({ input, showPoints: true, smartFormat: false });
            
            // Should contain full unit names (no smart formatting)
            expect(result).toContain('The Silent King');
            expect(result).toContain('Catacomb Command Barge');
            expect(result).toContain('Hexmark Destroyer');
            expect(result).toContain('Technomancer');
            expect(result).toContain('Cryptothralls');
            expect(result).toContain('Ophydian Destroyers');
            expect(result).toContain('Lokhust Heavy Destroyers');
            expect(result).toContain('Canoptek Wraiths');
            expect(result).toContain('Canoptek Reanimator');
            expect(result).toContain('Doomsday Ark');
        });

        test('cleans NewRecruit WTC-compact roster with model counts', () => {
            const expected = readFixture('sample-cleaned-nr-necrons-wtc-compact-with-models.txt');
            const result = cleanRosterText({ input, showPoints: true, smartFormat: true, showModels: true });
            expect(result).toBe(expected);
        });

        test('cleans NewRecruit WTC-compact roster with consolidate duplicates', () => {
            const result = cleanRosterText({ input, showPoints: true, smartFormat: true, consolidateDuplicates: true });
            
            // Should consolidate duplicate units
            expect(result).toContain('2 Technomancer (80)');
            expect(result).toContain('2 Cryptothralls (60)');
            expect(result).toContain('2 Canoptek Wraiths (220)');
            expect(result).toContain('2 Doomsday Ark (200)');
            
            // Should not consolidate unique units
            expect(result).toContain('The Silent King (420)');
            expect(result).toContain('Catacomb Command Barge (150)');
            expect(result).toContain('Hexmark Destroyer (100)');
            expect(result).toContain('Ophydian Destroyers (80)');
            expect(result).toContain('Lokhust Heavy Destroyers (55)');
            expect(result).toContain('Canoptek Reanimator (75)');
        });
    });
});

// Test model counting functions specifically
describe('Model Counting Functions', () => {
    describe('countModelsInNewRecruitUnit', () => {
        test('counts character units correctly', () => {
            const lines = [
                'Char1: 3x The Silent King (420 pts): Warlord',
                '• 1x Szarekh: Sceptre of Eternal Glory, Staff of Stars, Weapons of the Final Triarch',
                '• 2x Triarchal Menhir: 2 with Annihilator beam, Armoured bulk'
            ];
            const result = countModelsInNewRecruitUnit(lines, 0);
            expect(result).toBe(3);
        });

        test('counts regular unit lines correctly', () => {
            const lines = [
                '2x Cryptothralls (60 pts): 2 with Scouring eye, Scythed limbs'
            ];
            const result = countModelsInNewRecruitUnit(lines, 0);
            expect(result).toBe(2);
        });

        test('counts bullet point models correctly', () => {
            const lines = [
                '10x Cultist Mob (50 pts)',
                '• 1x Cultist Champion',
                '    1 with Brutal assault weapon, Autopistol',
                '• 9x Cultist',
                '    9 with Autopistol, Brutal assault weapon'
            ];
            const result = countModelsInNewRecruitUnit(lines, 0);
            expect(result).toBe(10);
        });

        test('returns 1 for single model units', () => {
            const lines = [
                '1x Chaos Lord in Terminator Armour (105 pts)',
                '1 with Combi-bolter, Exalted weapon'
            ];
            const result = countModelsInNewRecruitUnit(lines, 0);
            expect(result).toBe(1);
        });
    });
}); 