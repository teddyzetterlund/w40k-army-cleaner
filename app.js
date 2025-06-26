import { cleanRosterText } from './roster-cleaner.js';
import { validateElement, validateFunction } from './utils/validation-utils.js';
import { UI_CONSTANTS } from './config/ui-constants.js';
import { 
    getDOMElements, 
    updateOptionsButtonText, 
    readFileAsText, 
    copyToClipboard,
    scrollToOutput,
    getKeyboardShortcutText
} from './utils/dom-utils.js';
import { 
    saveFormattingOptions, 
    loadFormattingOptions 
} from './utils/storage-utils.js';

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
 * Copies the roster output to clipboard and shows feedback on the copy button
 * @param {HTMLElement} rosterOutput - The output element containing text to copy
 * @param {HTMLButtonElement} copyButton - The copy button element
 * @param {HTMLInputElement} discordFormatCheckbox - The Discord format checkbox element
 * @param {string} shortcutText - The keyboard shortcut text to preserve
 */
async function handleCopyRosterOutput(rosterOutput, copyButton, discordFormatCheckbox, shortcutText) {
    const baseText = UI_CONSTANTS.COPY_BUTTON_BASE_TEXT;
    const originalText = baseText + shortcutText;
    
    try {
        let textToCopy = rosterOutput.textContent;
        if (discordFormatCheckbox.checked) {
            textToCopy = `\`\`\`\n${textToCopy}\n\`\`\``;
        }
        await copyToClipboard(textToCopy);
        copyButton.textContent = UI_CONSTANTS.COPY_SUCCESS_TEXT;
        setTimeout(() => {
            copyButton.innerHTML = originalText;
        }, UI_CONSTANTS.COPY_FEEDBACK_DURATION_MS);
    } catch (error) {
        console.error('Copy failed:', error);
        // Could add user feedback here for clipboard errors
    }
}

/**
 * Sets up copy button functionality with error handling
 * @param {HTMLButtonElement} copyButton - The copy button element
 * @param {HTMLElement} rosterOutput - The output element containing text to copy
 * @param {HTMLInputElement} discordFormatCheckbox - The Discord format checkbox element
 */
function setupCopyButton(copyButton, rosterOutput, discordFormatCheckbox) {
    validateElement(copyButton, 'copyButton');
    validateElement(rosterOutput, 'rosterOutput');
    validateElement(discordFormatCheckbox, 'discordFormatCheckbox');

    // Set initial button text with keyboard shortcut
    const shortcutText = getKeyboardShortcutText();
    const baseText = UI_CONSTANTS.COPY_BUTTON_BASE_TEXT;
    copyButton.innerHTML = baseText + shortcutText;

    copyButton.addEventListener('click', async () => {
        await handleCopyRosterOutput(rosterOutput, copyButton, discordFormatCheckbox, shortcutText);
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
 * Sets up checkbox change handlers with storage persistence
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
            
            // Save current checkbox states to localStorage
            const currentOptions = {
                showHeader: checkboxes.find(cb => cb.id === 'show-header')?.checked ?? true,
                showPoints: checkboxes.find(cb => cb.id === 'show-points')?.checked ?? true,
                showModels: checkboxes.find(cb => cb.id === 'show-models')?.checked ?? false,
                inlineEnhancements: checkboxes.find(cb => cb.id === 'inline-enhancements')?.checked ?? true,
                smartFormat: checkboxes.find(cb => cb.id === 'smart-format')?.checked ?? true,
                consolidateDuplicates: checkboxes.find(cb => cb.id === 'consolidate-duplicates')?.checked ?? false,
                noEmptyLines: checkboxes.find(cb => cb.id === 'no-empty-lines')?.checked ?? false,
                oneLiner: checkboxes.find(cb => cb.id === 'one-liner')?.checked ?? false,
                discordFormat: checkboxes.find(cb => cb.id === 'discord-format')?.checked ?? false
            };
            saveFormattingOptions(currentOptions);
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
 * @param {HTMLInputElement} options.inlineEnhancementsCheckbox - Inline enhancements checkbox
 * @param {HTMLInputElement} options.showHeaderCheckbox - Show header checkbox
 * @param {HTMLInputElement} options.noEmptyLinesCheckbox - No empty lines checkbox
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
        oneLinerCheckbox,
        inlineEnhancementsCheckbox,
        showHeaderCheckbox,
        noEmptyLinesCheckbox
    } = options;

    // Validate all required elements
    [rosterInput, outputContainer, rosterOutput, showPointsCheckbox, smartFormatCheckbox, showModelsCheckbox, consolidateDuplicatesCheckbox, oneLinerCheckbox, inlineEnhancementsCheckbox, showHeaderCheckbox, noEmptyLinesCheckbox]
        .forEach((element, index) => {
            const names = ['rosterInput', 'outputContainer', 'rosterOutput', 'showPointsCheckbox', 'smartFormatCheckbox', 'showModelsCheckbox', 'consolidateDuplicatesCheckbox', 'oneLinerCheckbox', 'inlineEnhancementsCheckbox', 'showHeaderCheckbox', 'noEmptyLinesCheckbox'];
            validateElement(element, names[index]);
        });

    return function updateRosterOutput() {
        const input = rosterInput.value;
        const showPoints = showPointsCheckbox.checked;
        const smartFormat = smartFormatCheckbox.checked;
        const showModels = showModelsCheckbox.checked;
        const consolidateDuplicates = consolidateDuplicatesCheckbox.checked;
        const oneLiner = oneLinerCheckbox.checked;
        const inlineEnhancements = inlineEnhancementsCheckbox.checked;
        const showHeader = showHeaderCheckbox.checked;
        const noEmptyLines = noEmptyLinesCheckbox.checked;
        
        const cleaned = cleanRosterText({ input, showPoints, smartFormat, showModels, consolidateDuplicates, oneLiner, inlineEnhancements, showHeader, noEmptyLines });
        
        if (!cleaned) {
            outputContainer.classList.add(UI_CONSTANTS.HIDDEN_CLASS);
            return;
        }

        // Check if output container was previously hidden
        const wasHidden = outputContainer.classList.contains(UI_CONSTANTS.HIDDEN_CLASS);
        
        rosterOutput.textContent = cleaned;
        outputContainer.classList.remove(UI_CONSTANTS.HIDDEN_CLASS);
        
        // Only scroll if the container was previously hidden (new content)
        if (wasHidden) {
            scrollToOutput(outputContainer);
        }

        // Remove focus from the input field after processing
        rosterInput.blur();
    };
}

/**
 * Applies saved formatting options to checkbox elements
 * @param {object} elements - DOM elements object
 * @param {object} savedOptions - Saved formatting options
 */
function applySavedOptions(elements, savedOptions) {
    elements.showHeaderCheckbox.checked = savedOptions.showHeader;
    elements.showPointsCheckbox.checked = savedOptions.showPoints;
    elements.showModelsCheckbox.checked = savedOptions.showModels;
    elements.inlineEnhancementsCheckbox.checked = savedOptions.inlineEnhancements;
    elements.smartFormatCheckbox.checked = savedOptions.smartFormat;
    elements.consolidateDuplicatesCheckbox.checked = savedOptions.consolidateDuplicates;
    elements.noEmptyLinesCheckbox.checked = savedOptions.noEmptyLines;
    elements.oneLinerCheckbox.checked = savedOptions.oneLiner;
    elements.discordFormatCheckbox.checked = savedOptions.discordFormat;
}

/**
 * Initializes the application by setting up all DOM elements and event listeners
 */
function initializeApp() {
    try {
        const elements = getDOMElements();
        
        // Load saved formatting options and apply them to checkboxes
        const savedOptions = loadFormattingOptions();
        applySavedOptions(elements, savedOptions);
        
        const checkboxes = [
            elements.showPointsCheckbox, 
            elements.smartFormatCheckbox, 
            elements.showModelsCheckbox,
            elements.consolidateDuplicatesCheckbox,
            elements.oneLinerCheckbox,
            elements.inlineEnhancementsCheckbox,
            elements.discordFormatCheckbox,
            elements.showHeaderCheckbox,
            elements.noEmptyLinesCheckbox
        ];

        const updateRosterOutput = createUpdateRosterOutput(elements);

        setupDragAndDrop(elements.rosterInput, updateRosterOutput);
        setupCopyButton(elements.copyButton, elements.rosterOutput, elements.discordFormatCheckbox);
        setupOptionsMenu(
            elements.optionsMenuButton, 
            elements.optionsMenu, 
            checkboxes, 
            updateRosterOutput
        );

        elements.rosterInput.addEventListener('input', updateRosterOutput);

        // Add global keydown listener for CMD/CTRL+C copy shortcut
        window.addEventListener('keydown', async (e) => {
            // Only trigger if output is visible
            if (elements.outputContainer.classList.contains(UI_CONSTANTS.HIDDEN_CLASS)) return;
            // Only trigger if nothing is focused or focus is not on input/textarea/button
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'BUTTON')) return;
            // Only trigger on CMD/CTRL+C
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isCopy = (isMac && e.metaKey && e.key.toLowerCase() === 'c') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'c');
            if (!isCopy) return;
            e.preventDefault();
            await handleCopyRosterOutput(elements.rosterOutput, elements.copyButton, elements.discordFormatCheckbox, getKeyboardShortcutText());
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Could add user feedback here for initialization errors
    }
}

// Export functions for testing
export {
    setupDragAndDrop,
    setupCopyButton,
    setupMenuToggle,
    setupCheckboxHandlers,
    setupOptionsMenu,
    createUpdateRosterOutput,
    applySavedOptions,
    initializeApp
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp); 