/**
 * Validates that a value is a string
 * @param {any} value - The value to check
 * @param {string} paramName - The parameter name for the error message
 * @throws {Error} If the value is not a string
 */
export function validateString(value, paramName) {
    if (typeof value !== 'string') {
        throw new Error(`${paramName} must be a string`);
    }
}

/**
 * Validates that a value is a boolean
 * @param {any} value - The value to check
 * @param {string} paramName - The parameter name for the error message
 * @throws {Error} If the value is not a boolean
 */
export function validateBoolean(value, paramName) {
    if (typeof value !== 'boolean') {
        throw new Error(`${paramName} must be a boolean`);
    }
}

/**
 * Validates that a value is an array of strings
 * @param {any} value - The value to check
 * @param {string} paramName - The parameter name for the error message
 * @throws {Error} If the value is not an array of strings
 */
export function validateStringArray(value, paramName) {
    if (!Array.isArray(value)) {
        throw new Error(`${paramName} must be an array`);
    }
    if (!value.every(item => typeof item === 'string')) {
        throw new Error(`${paramName} must contain only strings`);
    }
}

/**
 * Validates that a value is a valid array index
 * @param {any} value - The value to check
 * @param {string} paramName - The parameter name for the error message
 * @param {number} arrayLength - The length of the array to check against
 * @throws {Error} If the value is not a valid array index
 */
export function validateArrayIndex(value, paramName, arrayLength) {
    if (!Number.isInteger(value)) {
        throw new Error(`${paramName} must be an integer`);
    }
    if (value < 0) {
        throw new Error(`${paramName} must be non-negative`);
    }
    if (value >= arrayLength) {
        throw new Error(`${paramName} must be less than array length ${arrayLength}`);
    }
} 