/**
 * Normalizes various types of apostrophes to a standard single quote
 * @param {string} text - The text to normalize
 * @returns {string} - Text with normalized apostrophes
 */
export const normalizeApostrophes = (text) => text.replace(/["'`′‵ʼ‘’]/g, "'");

/**
 * Normalizes faction names by removing special characters and converting to lowercase
 * @param {string} text - The faction name to normalize
 * @returns {string} - Normalized faction name
 */
export const normalizeFactionName = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/["'`′‵ʼ‘’]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

/**
 * Extracts points value from a line that contains points
 * @param {string} line - The line to extract points from
 * @returns {string|null} - The points value or null if not found
 */
export function extractPoints(line) {
    const match = line.match(/\((\d+)\)/);
    return match ? match[1] : null;
}

/**
 * Extracts the part of a line before the points
 * @param {string} line - The line to process
 * @returns {string} - The line without points
 */
export function getLineBeforePoints(line) {
    const lastParenIndex = line.lastIndexOf('(');
    return lastParenIndex !== -1 ? line.substring(0, lastParenIndex).trim() : line.trim();
}

/**
 * Extracts the points part of a line
 * @param {string} line - The line to process
 * @returns {string} - The points part including parentheses
 */
export function getPointsPart(line) {
    const lastParenIndex = line.lastIndexOf('(');
    return lastParenIndex !== -1 ? line.substring(lastParenIndex) : '';
} 