/**
 * Normalizes various types of apostrophes to a standard single quote
 * @param {string} text - The text to normalize
 * @returns {string} - Text with normalized apostrophes
 */
export const normalizeApostrophes = (text) => text.replace(/['''`′‵ʼ]/g, "'");

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
        .replace(/['''`′‵ʼ]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}; 