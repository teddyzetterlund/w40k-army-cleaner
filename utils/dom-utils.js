import { validateElement, validateFunction, validateFile } from './validation-utils.js';
import { UI_CONSTANTS } from '../config/ui-constants.js';

/**
 * Gets all required DOM elements for the application
 * @returns {object} Object containing all required DOM elements
 * @throws {Error} If any required element is not found
 */
export function getDOMElements() {
    const elements = {
        rosterInput: document.getElementById('roster-input'),
        outputContainer: document.getElementById('output-container'),
        rosterOutput: document.getElementById('roster-output'),
        copyButton: document.getElementById('copy-button'),
        showPointsCheckbox: document.getElementById('show-points'),
        smartFormatCheckbox: document.getElementById('smart-format'),
        showModelsCheckbox: document.getElementById('show-models'),
        consolidateDuplicatesCheckbox: document.getElementById('consolidate-duplicates'),
        oneLinerCheckbox: document.getElementById('one-liner'),
        optionsMenuButton: document.getElementById('options-menu-button'),
        optionsMenu: document.getElementById('options-menu')
    };

    // Validate all elements exist
    Object.entries(elements).forEach(([name, element]) => {
        if (!element) {
            throw new Error(`Required DOM element '${name}' not found`);
        }
    });

    return elements;
}

/**
 * Updates the options button text to show current selection count
 * @param {HTMLElement} optionsMenuButton - The options menu button element
 * @param {HTMLInputElement[]} checkboxes - Array of checkbox elements
 */
export function updateOptionsButtonText(optionsMenuButton, checkboxes) {
    validateElement(optionsMenuButton, 'optionsMenuButton');
    
    const checkedCount = checkboxes.filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    optionsMenuButton.textContent = UI_CONSTANTS.OPTIONS_BUTTON_TEXT_FORMAT
        .replace('{checked}', checkedCount)
        .replace('{total}', totalCount);
}

/**
 * Handles file reading from drag and drop
 * @param {File} file - The file to read
 * @param {Function} onLoad - Callback function when file is loaded
 * @param {Function} onError - Callback function when error occurs
 */
export function readFileAsText(file, onLoad, onError) {
    validateFile(file, 'file');
    validateFunction(onLoad, 'onLoad');
    validateFunction(onError, 'onError');

    const reader = new FileReader();
    reader.onload = (e) => onLoad(e.target.result);
    reader.onerror = onError;
    reader.readAsText(file);
}

/**
 * Copies text to clipboard with error handling
 * @param {string} text - Text to copy
 * @returns {Promise<void>} Promise that resolves when copy is successful
 * @throws {Error} If clipboard API is not available or copy fails
 */
export async function copyToClipboard(text) {
    if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
    }
    
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        throw new Error(`Failed to copy to clipboard: ${error.message}`);
    }
} 