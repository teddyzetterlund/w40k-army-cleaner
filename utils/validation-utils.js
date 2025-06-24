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

/**
 * Validates that a value is a DOM element
 * @param {any} value - The value to check
 * @param {string} paramName - The parameter name for the error message
 * @throws {Error} If the value is not a DOM element
 */
export function validateElement(value, paramName) {
    if (!(value instanceof Element)) {
        throw new Error(`${paramName} must be a DOM element`);
    }
}

/**
 * Validates that a value is a function
 * @param {any} value - The value to check
 * @param {string} paramName - The parameter name for the error message
 * @throws {Error} If the value is not a function
 */
export function validateFunction(value, paramName) {
    if (typeof value !== 'function') {
        throw new Error(`${paramName} must be a function`);
    }
}

/**
 * Validates that a value is a File object
 * @param {any} value - The value to check
 * @param {string} paramName - The parameter name for the error message
 * @throws {Error} If the value is not a File object
 */
export function validateFile(value, paramName) {
    if (!(value instanceof File)) {
        throw new Error(`${paramName} must be a File object`);
    }
} 