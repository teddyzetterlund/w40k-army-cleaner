import { normalizeApostrophes, normalizeFactionName } from '../utils/string-utils.js';

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
}); 