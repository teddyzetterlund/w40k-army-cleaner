import { cleanRosterText } from './roster-cleaner.js';
import { validateElement, validateFunction } from './utils/validation-utils.js';
import { UI_CONSTANTS } from './config/ui-constants.js';
import { 
    getDOMElements, 
    updateOptionsButtonText, 
    readFileAsText, 
    copyToClipboard 
} from './utils/dom-utils.js';

/**
 * Sets up drag and drop functionality for roster input
 * @param {HTMLTextAreaElement} rosterInput - The input element for roster text
 * @param {Function} updateRosterOutput - Callback to update roster output
 */
function setupDragAndDrop(rosterInput, updateRosterOutput) {
    validateElement(rosterInput, 'rosterInput');
    validateFunction(updateRosterOutput, 'updateRosterOutput');

    rosterInput.addEventListener('dragover', (e) => {
        e.preventDefault();
        rosterInput.classList.add(UI_CONSTANTS.DRAG_OVER_CLASS);
    });

    rosterInput.addEventListener('dragleave', () => {
        rosterInput.classList.remove(UI_CONSTANTS.DRAG_OVER_CLASS);
    });

    rosterInput.addEventListener('drop', (e) => {
        e.preventDefault();
        rosterInput.classList.remove(UI_CONSTANTS.DRAG_OVER_CLASS);
        
        const file = e.dataTransfer.files[0];
        if (file) {
            readFileAsText(
                file,
                (content) => {
                    rosterInput.value = content;
                    updateRosterOutput();
                },
                (error) => {
                    console.error('Failed to read file:', error);
                    // Could add user feedback here
                }
            );
        }
    });
}

/**
 * Sets up copy button functionality with error handling
 * @param {HTMLButtonElement} copyButton - The copy button element
 * @param {HTMLElement} rosterOutput - The output element containing text to copy
 */
function setupCopyButton(copyButton, rosterOutput) {
    validateElement(copyButton, 'copyButton');
    validateElement(rosterOutput, 'rosterOutput');

    copyButton.addEventListener('click', async () => {
        const originalText = copyButton.textContent;
        
        try {
            await copyToClipboard(rosterOutput.textContent);
            copyButton.textContent = UI_CONSTANTS.COPY_SUCCESS_TEXT;
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, UI_CONSTANTS.COPY_FEEDBACK_DURATION_MS);
        } catch (error) {
            console.error('Copy failed:', error);
            // Could add user feedback here for clipboard errors
        }
    });
}

/**
 * Sets up menu toggle functionality
 * @param {HTMLButtonElement} optionsMenuButton - The options menu button
 * @param {HTMLElement} optionsMenu - The options menu element
 */
function setupMenuToggle(optionsMenuButton, optionsMenu) {
    validateElement(optionsMenuButton, 'optionsMenuButton');
    validateElement(optionsMenu, 'optionsMenu');

    optionsMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsMenu.classList.toggle(UI_CONSTANTS.HIDDEN_CLASS);
    });

    optionsMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', () => {
        if (!optionsMenu.classList.contains(UI_CONSTANTS.HIDDEN_CLASS)) {
            optionsMenu.classList.add(UI_CONSTANTS.HIDDEN_CLASS);
        }
    });
}

/**
 * Sets up checkbox change handlers
 * @param {HTMLInputElement[]} checkboxes - Array of checkbox elements
 * @param {Function} updateRosterOutput - Callback to update roster output
 * @param {HTMLButtonElement} optionsMenuButton - The options menu button
 */
function setupCheckboxHandlers(checkboxes, updateRosterOutput, optionsMenuButton) {
    checkboxes.forEach(checkbox => {
        validateElement(checkbox, 'checkbox');
        checkbox.addEventListener('change', () => {
            updateRosterOutput();
            updateOptionsButtonText(optionsMenuButton, checkboxes);
        });
    });
}

/**
 * Sets up the complete options menu functionality
 * @param {HTMLButtonElement} optionsMenuButton - The options menu button
 * @param {HTMLElement} optionsMenu - The options menu element
 * @param {HTMLInputElement[]} checkboxes - Array of checkbox elements
 * @param {Function} updateRosterOutput - Callback to update roster output
 */
function setupOptionsMenu(optionsMenuButton, optionsMenu, checkboxes, updateRosterOutput) {
    validateElement(optionsMenuButton, 'optionsMenuButton');
    validateElement(optionsMenu, 'optionsMenu');
    validateFunction(updateRosterOutput, 'updateRosterOutput');

    setupMenuToggle(optionsMenuButton, optionsMenu);
    setupCheckboxHandlers(checkboxes, updateRosterOutput, optionsMenuButton);
    updateOptionsButtonText(optionsMenuButton, checkboxes);
}

/**
 * Creates a function to update roster output based on current input and options
 * @param {object} options - Configuration options
 * @param {HTMLTextAreaElement} options.rosterInput - The input element
 * @param {HTMLElement} options.outputContainer - The output container
 * @param {HTMLElement} options.rosterOutput - The output element
 * @param {HTMLInputElement} options.showPointsCheckbox - Show points checkbox
 * @param {HTMLInputElement} options.smartFormatCheckbox - Smart format checkbox
 * @param {HTMLInputElement} options.showModelsCheckbox - Show models checkbox
 * @param {HTMLInputElement} options.consolidateDuplicatesCheckbox - Consolidate duplicates checkbox
 * @param {HTMLInputElement} options.oneLinerCheckbox - One-liner output checkbox
 * @returns {Function} Function to update roster output
 */
function createUpdateRosterOutput(options) {
    const { 
        rosterInput, 
        outputContainer, 
        rosterOutput, 
        showPointsCheckbox, 
        smartFormatCheckbox, 
        showModelsCheckbox,
        consolidateDuplicatesCheckbox,
        oneLinerCheckbox
    } = options;

    // Validate all required elements
    [rosterInput, outputContainer, rosterOutput, showPointsCheckbox, smartFormatCheckbox, showModelsCheckbox, consolidateDuplicatesCheckbox, oneLinerCheckbox]
        .forEach((element, index) => {
            const names = ['rosterInput', 'outputContainer', 'rosterOutput', 'showPointsCheckbox', 'smartFormatCheckbox', 'showModelsCheckbox', 'consolidateDuplicatesCheckbox', 'oneLinerCheckbox'];
            validateElement(element, names[index]);
        });

    return function updateRosterOutput() {
        const input = rosterInput.value;
        const showPoints = showPointsCheckbox.checked;
        const smartFormat = smartFormatCheckbox.checked;
        const showModels = showModelsCheckbox.checked;
        const consolidateDuplicates = consolidateDuplicatesCheckbox.checked;
        const oneLiner = oneLinerCheckbox.checked;
        
        const cleaned = cleanRosterText({ input, showPoints, smartFormat, showModels, consolidateDuplicates, oneLiner });
        
        if (!cleaned) {
            outputContainer.classList.add(UI_CONSTANTS.HIDDEN_CLASS);
            return;
        }

        rosterOutput.textContent = cleaned;
        outputContainer.classList.remove(UI_CONSTANTS.HIDDEN_CLASS);
    };
}

/**
 * Initializes the application by setting up all DOM elements and event listeners
 */
function initializeApp() {
    try {
        const elements = getDOMElements();
        const checkboxes = [
            elements.showPointsCheckbox, 
            elements.smartFormatCheckbox, 
            elements.showModelsCheckbox,
            elements.consolidateDuplicatesCheckbox,
            elements.oneLinerCheckbox
        ];

        const updateRosterOutput = createUpdateRosterOutput(elements);

        setupDragAndDrop(elements.rosterInput, updateRosterOutput);
        setupCopyButton(elements.copyButton, elements.rosterOutput);
        setupOptionsMenu(
            elements.optionsMenuButton, 
            elements.optionsMenu, 
            checkboxes, 
            updateRosterOutput
        );

        elements.rosterInput.addEventListener('input', updateRosterOutput);
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Could add user feedback here for initialization errors
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp); 