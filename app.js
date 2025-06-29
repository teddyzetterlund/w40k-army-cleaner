import { cleanRosterText } from './roster-cleaner.js';
import { validateElement, validateFunction } from './utils/validation-utils.js';
import { UI_CONSTANTS } from './config/ui-constants.js';
import { 
    getDOMElements, 
    updateOptionsButtonText, 
    readFileAsText, 
    copyToClipboard,
    getKeyboardShortcutText
} from './utils/dom-utils.js';
import { 
    saveFormattingOptions, 
    loadFormattingOptions 
} from './utils/storage-utils.js';

/**
 * Sample roster content for demonstration purposes
 * This is a Dark Angels roster exported from the Games Workshop app
 */
const SAMPLE_ROSTER_CONTENT = `The Hunt Never Ended (2000 Points)

Space Marines
Dark Angels
Unforgiven Task Force
Strike Force (2000 Points)

CHARACTERS

Azrael (115 Points)
  • Warlord
  • 1x Lion's Wrath
  • 1x The Lion Helm
  • 1x The Sword of Secrets

Captain in Terminator Armour (110 Points)
  • 1x Relic weapon
  • 1x Storm bolter
  • Enhancements: Stubborn Tenacity

Chaplain in Terminator Armour (75 Points)
  • 1x Crozius arcanum
  • 1x Storm bolter

Lieutenant with Combi-weapon (70 Points)
  • 1x Combi-weapon
  • 1x Paired combat blades

BATTLELINE

Assault Intercessor Squad (75 Points)
  • 1x Assault Intercessor Sergeant
     ◦ 1x Plasma pistol
     ◦ 1x Power weapon
  • 4x Assault Intercessor
     ◦ 4x Astartes chainsword
     ◦ 4x Heavy bolt pistol

Assault Intercessor Squad (75 Points)
  • 1x Assault Intercessor Sergeant
     ◦ 1x Plasma pistol
     ◦ 1x Power weapon
  • 4x Assault Intercessor
     ◦ 4x Astartes chainsword
     ◦ 4x Heavy bolt pistol

Intercessor Squad (80 Points)
  • 1x Intercessor Sergeant
     ◦ 1x Astartes grenade launcher
     ◦ 1x Bolt pistol
     ◦ 1x Bolt rifle
     ◦ 1x Thunder hammer
  • 4x Intercessor
     ◦ 4x Bolt pistol
     ◦ 4x Bolt rifle
     ◦ 4x Close combat weapon

OTHER DATASHEETS

Deathwing Knights (250 Points)
  • 1x Watcher in the Dark
  • 1x Knight Master
     ◦ 1x Great weapon of the Unforgiven
  • 4x Deathwing Knight
     ◦ 4x Mace of absolution

Deathwing Knights (250 Points)
  • 1x Watcher in the Dark
  • 1x Knight Master
     ◦ 1x Great weapon of the Unforgiven
  • 4x Deathwing Knight
     ◦ 4x Mace of absolution

Deathwing Terminator Squad (180 Points)
  • 1x Watcher in the Dark
  • 1x Deathwing Sergeant
     ◦ 1x Power weapon
     ◦ 1x Storm bolter
  • 4x Deathwing Terminator
     ◦ 1x Cyclone missile launcher
     ◦ 4x Power fist
     ◦ 4x Storm bolter

Deathwing Terminator Squad (180 Points)
  • 1x Watcher in the Dark
  • 1x Deathwing Sergeant
     ◦ 1x Power weapon
     ◦ 1x Storm bolter
  • 4x Deathwing Terminator
     ◦ 1x Cyclone missile launcher
     ◦ 4x Power fist
     ◦ 4x Storm bolter

Hellblaster Squad (230 Points)
  • 1x Hellblaster Sergeant
     ◦ 1x Close combat weapon
     ◦ 1x Plasma incinerator
     ◦ 1x Plasma pistol
  • 9x Hellblaster
     ◦ 9x Bolt pistol
     ◦ 9x Close combat weapon
     ◦ 9x Plasma incinerator

Land Raider (240 Points)
  • 1x Armoured tracks
  • 2x Godhammer lascannon
  • 1x Hunter-killer missile
  • 1x Multi-melta
  • 1x Storm bolter
  • 1x Twin heavy bolter

Scout Squad (70 Points)
  • 1x Scout Sergeant
     ◦ 1x Astartes chainsword
     ◦ 1x Bolt pistol
     ◦ 1x Close combat weapon
  • 4x Scout
     ◦ 4x Bolt pistol
     ◦ 3x Boltgun
     ◦ 4x Close combat weapon
     ◦ 1x Missile launcher

Exported with App Version: v1.34.0 (1), Data Version: v620`;

// Service Worker Registration and Update Handling
if ('serviceWorker' in navigator) {
    let updateAvailable = false;
    let newWorker = null;

    // Force clear old caches and unregister old service worker
    const forceUpdate = async () => {
        try {
            // Clear all caches
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
            
            // Unregister all service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(registration => registration.unregister()));
            
            console.warn('Forced cache and service worker cleanup completed');
        } catch (error) {
            console.error('Error during forced cleanup:', error);
        }
    };

    // Run forced update on page load
    forceUpdate();

    // Check if user needs to see update banner
    const checkForUpdateBanner = () => {
        const CURRENT_VERSION = '1.1.0';
        const storedVersion = localStorage.getItem('app-version');
        
        // Show banner if no version stored (first time user) or version is older
        if (!storedVersion || storedVersion !== CURRENT_VERSION) {
            showUpdateBanner();
        }
        
        // Store current version
        localStorage.setItem('app-version', CURRENT_VERSION);
    };

    // Show update banner for users with old version
    const showUpdateBanner = () => {
        // Don't show if already shown
        if (document.getElementById('update-banner')) return;
        
        const CURRENT_VERSION = '1.1.0';
        const storedVersion = localStorage.getItem('app-version') || 'unknown';
        
        const banner = document.createElement('div');
        banner.id = 'update-banner';
        banner.innerHTML = `
            <div class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
                <div class="flex items-start justify-between">
                    <div class="flex-1 mr-4">
                        <h3 class="font-semibold mb-2">Update Available!</h3>
                        <p class="text-sm opacity-90 mb-2">
                            You're currently on version ${storedVersion}. 
                            Update to version ${CURRENT_VERSION} to get NewRecruit roster format support.
                        </p>
                        <button id="update-now-btn" class="bg-white text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                            Update Now
                        </button>
                    </div>
                    <button id="dismiss-update" class="text-white opacity-70 hover:opacity-100 transition-opacity">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Handle update button
        document.getElementById('update-now-btn').addEventListener('click', () => {
            // Force reload to get the latest version
            window.location.reload();
        });
        
        // Handle dismiss button
        document.getElementById('dismiss-update').addEventListener('click', () => {
            banner.remove();
            // Remember dismissal for this session
            sessionStorage.setItem('update-banner-dismissed', 'true');
        });
        
        // No auto-hide - banner stays until user updates or dismisses
    };

    // Check for update banner after a short delay
    setTimeout(checkForUpdateBanner, 1000);

    // Register service worker
    navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
            // Check for updates
            registration.addEventListener('updatefound', () => {
                newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        updateAvailable = true;
                        showUpdateNotification();
                    }
                });
            });
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });

    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (updateAvailable) {
            // Reload the page to use the new service worker
            window.location.reload();
        }
    });

    // Show update notification
    function showUpdateNotification() {
        // Create update notification
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.innerHTML = `
            <div class="fixed top-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h3 class="font-semibold mb-1">Update Available</h3>
                        <p class="text-sm opacity-90">New features are available! Click to update.</p>
                    </div>
                    <button id="update-button" class="ml-4 bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                        Update
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Handle update button click
        document.getElementById('update-button').addEventListener('click', () => {
            if (newWorker) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
        });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
}

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
 * @param {HTMLElement} options.inputPhase - The input phase container
 * @param {HTMLElement} options.outputPhase - The output phase container
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
        inputPhase, 
        outputPhase, 
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
    [rosterInput, inputPhase, outputPhase, rosterOutput, showPointsCheckbox, smartFormatCheckbox, showModelsCheckbox, consolidateDuplicatesCheckbox, oneLinerCheckbox, inlineEnhancementsCheckbox, showHeaderCheckbox, noEmptyLinesCheckbox]
        .forEach((element, index) => {
            const names = ['rosterInput', 'inputPhase', 'outputPhase', 'rosterOutput', 'showPointsCheckbox', 'smartFormatCheckbox', 'showModelsCheckbox', 'consolidateDuplicatesCheckbox', 'oneLinerCheckbox', 'inlineEnhancementsCheckbox', 'showHeaderCheckbox', 'noEmptyLinesCheckbox'];
            validateElement(element, names[index]);
        });

    return function updateRosterOutput() {
        const input = rosterInput.value.trim();
        const showPoints = showPointsCheckbox.checked;
        const smartFormat = smartFormatCheckbox.checked;
        const showModels = showModelsCheckbox.checked;
        const consolidateDuplicates = consolidateDuplicatesCheckbox.checked;
        const oneLiner = oneLinerCheckbox.checked;
        const inlineEnhancements = inlineEnhancementsCheckbox.checked;
        const showHeader = showHeaderCheckbox.checked;
        const noEmptyLines = noEmptyLinesCheckbox.checked;
        
        if (!input) {
            // No input - show input phase
            inputPhase.classList.remove(UI_CONSTANTS.HIDDEN_CLASS);
            outputPhase.classList.add(UI_CONSTANTS.HIDDEN_CLASS);
            return;
        }

        const cleaned = cleanRosterText({ input, showPoints, smartFormat, showModels, consolidateDuplicates, oneLiner, inlineEnhancements, showHeader, noEmptyLines });
        
        if (!cleaned) {
            // Invalid input - show input phase
            inputPhase.classList.remove(UI_CONSTANTS.HIDDEN_CLASS);
            outputPhase.classList.add(UI_CONSTANTS.HIDDEN_CLASS);
            return;
        }

        // Check if we're transitioning from input to output phase
        const wasInInputPhase = !inputPhase.classList.contains(UI_CONSTANTS.HIDDEN_CLASS);
        
        rosterOutput.textContent = cleaned;
        
        // Switch to output phase
        inputPhase.classList.add(UI_CONSTANTS.HIDDEN_CLASS);
        outputPhase.classList.remove(UI_CONSTANTS.HIDDEN_CLASS);
        
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
 * Sets up the edit input functionality
 * @param {HTMLButtonElement} editButton - The edit button element
 * @param {HTMLElement} inputPhase - The input phase container
 * @param {HTMLElement} outputPhase - The output phase container
 * @param {HTMLTextAreaElement} rosterInput - The input element
 */
function setupEditInput(editButton, inputPhase, outputPhase, rosterInput) {
    validateElement(editButton, 'editButton');
    validateElement(inputPhase, 'inputPhase');
    validateElement(outputPhase, 'outputPhase');
    validateElement(rosterInput, 'rosterInput');

    editButton.addEventListener('click', () => {
        // Switch back to input phase
        outputPhase.classList.add(UI_CONSTANTS.HIDDEN_CLASS);
        inputPhase.classList.remove(UI_CONSTANTS.HIDDEN_CLASS);
        
        // Focus the input field and select all text
        rosterInput.focus();
        rosterInput.select();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Sets up the sample roster functionality
 * @param {HTMLButtonElement} trySampleButton - The try sample roster button element
 * @param {HTMLTextAreaElement} rosterInput - The input element
 * @param {Function} updateRosterOutput - Callback to update roster output
 */
function setupSampleRoster(trySampleButton, rosterInput, updateRosterOutput) {
    validateElement(trySampleButton, 'trySampleButton');
    validateElement(rosterInput, 'rosterInput');
    validateFunction(updateRosterOutput, 'updateRosterOutput');

    trySampleButton.addEventListener('click', () => {
        // Load the sample roster content
        rosterInput.value = SAMPLE_ROSTER_CONTENT;
        
        // Trigger the input event to let the normal flow handle the rest
        rosterInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Focus the input field
        rosterInput.focus();
    });
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
            // Only trigger if output phase is visible
            if (elements.outputPhase.classList.contains(UI_CONSTANTS.HIDDEN_CLASS)) return;
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

        setupEditInput(elements.editButton, elements.inputPhase, elements.outputPhase, elements.rosterInput);
        
        // Set up sample roster functionality if the button exists
        if (elements.trySampleRosterButton) {
            setupSampleRoster(elements.trySampleRosterButton, elements.rosterInput, updateRosterOutput);
        }
        
        // Focus the roster input on page load
        elements.rosterInput.focus();
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
    setupEditInput,
    setupSampleRoster,
    initializeApp
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp); 