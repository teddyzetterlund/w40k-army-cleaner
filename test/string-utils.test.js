import { 
    normalizeApostrophes, 
    normalizeFactionName,
    extractPoints,
    getLineBeforePoints,
    getPointsPart
} from '../utils/string-utils.js';

describe('string-utils', () => {
    describe('normalizeApostrophes', () => {
        it('should replace various apostrophe-like characters with a standard single quote', () => {
            const input = "‘foo’ `bar` ′baz‵ ʼqux'";
            const expected = "'foo' 'bar' 'baz' 'qux'";
            expect(normalizeApostrophes(input)).toBe(expected);
        });

        it('should not modify text with only standard apostrophes', () => {
            expect(normalizeApostrophes("it's a test")).toBe("it's a test");
        });

        it('should handle empty string', () => {
            expect(normalizeApostrophes('')).toBe('');
        });
    });

    describe('normalizeFactionName', () => {
        it('should lowercase, remove diacritics, apostrophes, and non-alphanumeric characters', () => {
            const input = "T'au Émpïré!";
            const expected = "tauempire";
            expect(normalizeFactionName(input)).toBe(expected);
        });

        it('should remove spaces and punctuation', () => {
            expect(normalizeFactionName('Space Marines!')).toBe('spacemarines');
            expect(normalizeFactionName('Astra Militarum.')).toBe('astramilitarum');
        });

        it('should handle empty string', () => {
            expect(normalizeFactionName('')).toBe('');
        });

        it('should handle null and undefined', () => {
            expect(normalizeFactionName(null)).toBe('');
            expect(normalizeFactionName(undefined)).toBe('');
        });

        it('should remove all special apostrophe-like characters', () => {
            expect(normalizeFactionName("O'Shovah")).toBe('oshovah');
            expect(normalizeFactionName("O`Shovah")).toBe('oshovah');
        });
    });

    describe('Points and Enhancement Utilities', () => {
        test('extractPoints extracts points value from line', () => {
            expect(extractPoints('Tactical Squad (110)')).toBe('110');
            expect(extractPoints('Lord in Terminator Armour [Bastion Plate] (105)')).toBe('105');
            expect(extractPoints('Cultists')).toBe(null);
            expect(extractPoints('')).toBe(null);
        });

        test('getLineBeforePoints extracts part before points', () => {
            expect(getLineBeforePoints('Tactical Squad (110)')).toBe('Tactical Squad');
            expect(getLineBeforePoints('Lord in Terminator Armour [Bastion Plate] (105)')).toBe('Lord in Terminator Armour [Bastion Plate]');
            expect(getLineBeforePoints('Cultists')).toBe('Cultists');
            expect(getLineBeforePoints('')).toBe('');
        });

        test('getPointsPart extracts points part', () => {
            expect(getPointsPart('Tactical Squad (110)')).toBe('(110)');
            expect(getPointsPart('Lord in Terminator Armour [Bastion Plate] (105)')).toBe('(105)');
            expect(getPointsPart('Cultists')).toBe('');
            expect(getPointsPart('')).toBe('');
        });
    });
}); 