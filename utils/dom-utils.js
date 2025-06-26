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
        inputPhase: document.getElementById('input-phase'),
        outputPhase: document.getElementById('output-phase'),
        rosterOutput: document.getElementById('roster-output'),
        copyButton: document.getElementById('copy-button'),
        editButton: document.getElementById('edit-input'),
        showPointsCheckbox: document.getElementById('show-points'),
        smartFormatCheckbox: document.getElementById('smart-format'),
        showModelsCheckbox: document.getElementById('show-models'),
        consolidateDuplicatesCheckbox: document.getElementById('consolidate-duplicates'),
        oneLinerCheckbox: document.getElementById('one-liner'),
        inlineEnhancementsCheckbox: document.getElementById('inline-enhancements'),
        discordFormatCheckbox: document.getElementById('discord-format'),
        showHeaderCheckbox: document.getElementById('show-header'),
        optionsMenuButton: document.getElementById('options-menu-button'),
        optionsMenu: document.getElementById('options-menu'),
        noEmptyLinesCheckbox: document.getElementById('no-empty-lines'),
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

/**
 * Jumps to the output container without animation
 * @param {HTMLElement} outputContainer - The output container element to scroll to
 */
export function scrollToOutput(outputContainer) {
    validateElement(outputContainer, 'outputContainer');
    outputContainer.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
}

/**
 * Gets the appropriate keyboard shortcut text for the current platform
 * @returns {string} The keyboard shortcut text with kbd tags (e.g., " (<kbd>CMD</kbd>+<kbd>C</kbd>)" or " (<kbd>CTRL</kbd>+<kbd>C</kbd>)") or empty string for mobile
 */
export function getKeyboardShortcutText() {
    // Check if this is a mobile device without a physical keyboard
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // For mobile devices, check if they have a keyboard attached
    if (isMobile) {
        // On iOS, we can detect if a keyboard is connected
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            // For iPads with Magic Keyboard or other external keyboards, show the shortcut
            // We'll assume iPad users might have keyboards, but iPhone users typically don't
            if (/iPad/.test(navigator.userAgent)) {
                return navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? ' (<kbd>CMD</kbd>+<kbd>C</kbd>)' : ' (<kbd>CTRL</kbd>+<kbd>C</kbd>)';
            }
            return ''; // No shortcut for iPhone
        }
        return ''; // No shortcut for other mobile devices
    }
    
    // For desktop devices, show the appropriate shortcut
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return isMac ? ' (<kbd>CMD</kbd>+<kbd>C</kbd>)' : ' (<kbd>CTRL</kbd>+<kbd>C</kbd>)';
} 