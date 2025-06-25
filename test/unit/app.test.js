import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
    setupDragAndDrop, 
    setupCopyButton, 
    setupMenuToggle, 
    setupCheckboxHandlers, 
    setupOptionsMenu, 
    createUpdateRosterOutput,
    initializeApp 
} from '../../app.js';
import { cleanRosterText } from '../../roster-cleaner.js';
import { 
    getDOMElements, 
    updateOptionsButtonText, 
    readFileAsText, 
    copyToClipboard,
    getKeyboardShortcutText
} from '../../utils/dom-utils.js';

// Mock dependencies
vi.mock('../../roster-cleaner.js');
vi.mock('../../utils/dom-utils.js');
vi.mock('../../utils/validation-utils.js');
vi.mock('../../config/ui-constants.js', () => ({
    UI_CONSTANTS: {
        DRAG_OVER_CLASS: 'drag-over',
        HIDDEN_CLASS: 'hidden',
        COPY_BUTTON_BASE_TEXT: 'Copy',
        COPY_SUCCESS_TEXT: 'Copied!',
        COPY_FEEDBACK_DURATION_MS: 2000
    }
}));

describe('App Unit Tests', () => {
    let mockElements;
    let mockUpdateRosterOutput;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        
        // Mock window.addEventListener for global event listeners
        window.addEventListener = vi.fn();
        
        // Create mock DOM elements
        mockElements = {
            rosterInput: document.createElement('textarea'),
            outputContainer: document.createElement('div'),
            rosterOutput: document.createElement('div'),
            copyButton: document.createElement('button'),
            showPointsCheckbox: document.createElement('input'),
            smartFormatCheckbox: document.createElement('input'),
            showModelsCheckbox: document.createElement('input'),
            consolidateDuplicatesCheckbox: document.createElement('input'),
            oneLinerCheckbox: document.createElement('input'),
            inlineEnhancementsCheckbox: document.createElement('input'),
            optionsMenuButton: document.createElement('button'),
            optionsMenu: document.createElement('div'),
            discordFormatCheckbox: document.createElement('input'),
            showHeaderCheckbox: document.createElement('input'),
            noEmptyLinesCheckbox: document.createElement('input')
        };

        // Set up checkbox types
        mockElements.showPointsCheckbox.type = 'checkbox';
        mockElements.smartFormatCheckbox.type = 'checkbox';
        mockElements.showModelsCheckbox.type = 'checkbox';
        mockElements.consolidateDuplicatesCheckbox.type = 'checkbox';
        mockElements.oneLinerCheckbox.type = 'checkbox';
        mockElements.inlineEnhancementsCheckbox.type = 'checkbox';
        mockElements.discordFormatCheckbox.type = 'checkbox';
        mockElements.showHeaderCheckbox.type = 'checkbox';
        mockElements.noEmptyLinesCheckbox.type = 'checkbox';

        // Set initial menu state to hidden
        mockElements.optionsMenu.classList.add('hidden');

        // Mock addEventListener for rosterInput so we can spy on it
        mockElements.rosterInput.addEventListener = vi.fn();

        // Mock getDOMElements
        getDOMElements.mockReturnValue(mockElements);
        
        // Mock cleanRosterText
        cleanRosterText.mockReturnValue('cleaned roster output');
        
        // Mock updateOptionsButtonText
        updateOptionsButtonText.mockImplementation(() => {});
        
        // Mock readFileAsText
        readFileAsText.mockImplementation((file, onLoad, onError) => {
            onLoad('file content');
        });
        
        // Mock copyToClipboard
        copyToClipboard.mockResolvedValue();

        // Mock getKeyboardShortcutText
        getKeyboardShortcutText.mockReturnValue(' (CMD+C)');

        // Create mock update function
        mockUpdateRosterOutput = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('setupDragAndDrop', () => {
        // See TODO.md for robust simulation of drag-and-drop events
        it.skip('should set up drag and drop event listeners', () => {
            // Skipped: Needs robust DOM event simulation (see TODO.md)
        });

        it.skip('should handle file drop and update roster', () => {
            // Skipped: Needs robust DOM event simulation (see TODO.md)
        });

        it('should handle drop without files gracefully', () => {
            const rosterInput = mockElements.rosterInput;
            const updateRosterOutput = vi.fn();

            setupDragAndDrop(rosterInput, updateRosterOutput);

            const dropEvent = new Event('drop');
            dropEvent.dataTransfer = { files: [] };

            expect(() => rosterInput.dispatchEvent(dropEvent)).not.toThrow();
        });
    });

    describe('setupCopyButton', () => {
        it('should set up copy button click handler', async () => {
            const copyButton = mockElements.copyButton;
            const rosterOutput = mockElements.rosterOutput;
            const discordFormatCheckbox = mockElements.discordFormatCheckbox;
            rosterOutput.textContent = 'test content';

            setupCopyButton(copyButton, rosterOutput, discordFormatCheckbox);

            const clickEvent = new Event('click');
            await copyButton.dispatchEvent(clickEvent);

            expect(copyToClipboard).toHaveBeenCalledWith('test content');
        });

        it('should set copy button text with keyboard shortcut', () => {
            const copyButton = mockElements.copyButton;
            const rosterOutput = mockElements.rosterOutput;
            const discordFormatCheckbox = mockElements.discordFormatCheckbox;

            // Mock the keyboard shortcut text
            getKeyboardShortcutText.mockReturnValue(' (CMD+C)');

            setupCopyButton(copyButton, rosterOutput, discordFormatCheckbox);

            expect(copyButton.textContent).toBe('Copy (CMD+C)');
        });

        it('should wrap output in markdown fenced code blocks when Discord format is enabled', async () => {
            const copyButton = mockElements.copyButton;
            const rosterOutput = mockElements.rosterOutput;
            const discordFormatCheckbox = mockElements.discordFormatCheckbox;
            
            rosterOutput.textContent = 'test content';
            discordFormatCheckbox.checked = true;

            setupCopyButton(copyButton, rosterOutput, discordFormatCheckbox);

            const clickEvent = new Event('click');
            await copyButton.dispatchEvent(clickEvent);

            expect(copyToClipboard).toHaveBeenCalledWith('```\ntest content\n```');
        });

        it('should not wrap output in markdown when Discord format is disabled', async () => {
            const copyButton = mockElements.copyButton;
            const rosterOutput = mockElements.rosterOutput;
            const discordFormatCheckbox = mockElements.discordFormatCheckbox;
            
            rosterOutput.textContent = 'test content';
            discordFormatCheckbox.checked = false;

            setupCopyButton(copyButton, rosterOutput, discordFormatCheckbox);

            const clickEvent = new Event('click');
            await copyButton.dispatchEvent(clickEvent);

            expect(copyToClipboard).toHaveBeenCalledWith('test content');
        });

        it('should show success feedback and restore original text', async () => {
            const copyButton = mockElements.copyButton;
            const rosterOutput = mockElements.rosterOutput;
            const discordFormatCheckbox = mockElements.discordFormatCheckbox;
            const originalText = 'Copy (CMD+C)';
            copyButton.textContent = originalText;

            setupCopyButton(copyButton, rosterOutput, discordFormatCheckbox);

            const clickEvent = new Event('click');
            await copyButton.dispatchEvent(clickEvent);

            expect(copyButton.textContent).toBe('Copied!');
            
            // Wait for timeout to restore original text
            await new Promise(resolve => setTimeout(resolve, 2100));
            expect(copyButton.textContent).toBe(originalText);
        });

        it('should handle copy errors gracefully', async () => {
            const copyButton = mockElements.copyButton;
            const rosterOutput = mockElements.rosterOutput;
            const discordFormatCheckbox = mockElements.discordFormatCheckbox;
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            copyToClipboard.mockRejectedValue(new Error('Copy failed'));

            setupCopyButton(copyButton, rosterOutput, discordFormatCheckbox);

            const clickEvent = new Event('click');
            await copyButton.dispatchEvent(clickEvent);

            expect(consoleSpy).toHaveBeenCalledWith('Copy failed:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('setupMenuToggle', () => {
        it('should toggle menu visibility on button click', () => {
            const optionsMenuButton = mockElements.optionsMenuButton;
            const optionsMenu = mockElements.optionsMenu;

            setupMenuToggle(optionsMenuButton, optionsMenu);

            const clickEvent = new Event('click');
            optionsMenuButton.dispatchEvent(clickEvent);

            expect(optionsMenu.classList.contains('hidden')).toBe(false);

            optionsMenuButton.dispatchEvent(clickEvent);
            expect(optionsMenu.classList.contains('hidden')).toBe(true);
        });

        it('should prevent event propagation on menu click', () => {
            const optionsMenuButton = mockElements.optionsMenuButton;
            const optionsMenu = mockElements.optionsMenu;

            setupMenuToggle(optionsMenuButton, optionsMenu);

            const menuClickEvent = new Event('click');
            const stopPropagationSpy = vi.spyOn(menuClickEvent, 'stopPropagation');

            optionsMenu.dispatchEvent(menuClickEvent);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });

        it('should close menu when clicking outside', () => {
            const optionsMenuButton = mockElements.optionsMenuButton;
            const optionsMenu = mockElements.optionsMenu;

            setupMenuToggle(optionsMenuButton, optionsMenu);

            // Open menu first
            optionsMenuButton.dispatchEvent(new Event('click'));
            expect(optionsMenu.classList.contains('hidden')).toBe(false);

            // Click outside
            document.dispatchEvent(new Event('click'));
            expect(optionsMenu.classList.contains('hidden')).toBe(true);
        });
    });

    describe('setupCheckboxHandlers', () => {
        it('should set up change handlers for all checkboxes', () => {
            const checkboxes = [
                mockElements.showPointsCheckbox,
                mockElements.smartFormatCheckbox,
                mockElements.showModelsCheckbox
            ];
            const updateRosterOutput = vi.fn();
            const optionsMenuButton = mockElements.optionsMenuButton;

            setupCheckboxHandlers(checkboxes, updateRosterOutput, optionsMenuButton);

            // Test each checkbox
            checkboxes.forEach(checkbox => {
                const changeEvent = new Event('change');
                checkbox.dispatchEvent(changeEvent);
            });

            expect(updateRosterOutput).toHaveBeenCalledTimes(3);
            expect(updateOptionsButtonText).toHaveBeenCalledTimes(3);
        });
    });

    describe('setupOptionsMenu', () => {
        it('should set up complete options menu functionality', () => {
            const optionsMenuButton = mockElements.optionsMenuButton;
            const optionsMenu = mockElements.optionsMenu;
            const checkboxes = [
                mockElements.showPointsCheckbox,
                mockElements.smartFormatCheckbox
            ];
            const updateRosterOutput = vi.fn();

            setupOptionsMenu(optionsMenuButton, optionsMenu, checkboxes, updateRosterOutput);

            // Verify menu toggle works
            optionsMenuButton.dispatchEvent(new Event('click'));
            expect(optionsMenu.classList.contains('hidden')).toBe(false);

            // Verify checkbox handlers work
            checkboxes[0].dispatchEvent(new Event('change'));
            expect(updateRosterOutput).toHaveBeenCalled();
            expect(updateOptionsButtonText).toHaveBeenCalled();
        });
    });

    describe('createUpdateRosterOutput', () => {
        it('should create function that calls cleanRosterText with correct parameters', () => {
            const options = {
                rosterInput: mockElements.rosterInput,
                outputContainer: mockElements.outputContainer,
                rosterOutput: mockElements.rosterOutput,
                showPointsCheckbox: mockElements.showPointsCheckbox,
                smartFormatCheckbox: mockElements.smartFormatCheckbox,
                showModelsCheckbox: mockElements.showModelsCheckbox,
                consolidateDuplicatesCheckbox: mockElements.consolidateDuplicatesCheckbox,
                oneLinerCheckbox: mockElements.oneLinerCheckbox,
                inlineEnhancementsCheckbox: mockElements.inlineEnhancementsCheckbox,
                showHeaderCheckbox: mockElements.showHeaderCheckbox,
                noEmptyLinesCheckbox: mockElements.noEmptyLinesCheckbox
            };

            // Set checkbox states
            options.showPointsCheckbox.checked = true;
            options.smartFormatCheckbox.checked = false;
            options.showModelsCheckbox.checked = true;
            options.consolidateDuplicatesCheckbox.checked = false;
            options.oneLinerCheckbox.checked = true;
            options.inlineEnhancementsCheckbox.checked = false;
            options.showHeaderCheckbox.checked = true;
            options.noEmptyLinesCheckbox.checked = false;
            options.rosterInput.value = 'test input';

            const updateRosterOutput = createUpdateRosterOutput(options);
            updateRosterOutput();

            expect(cleanRosterText).toHaveBeenCalledWith({
                input: 'test input',
                showPoints: true,
                smartFormat: false,
                showModels: true,
                consolidateDuplicates: false,
                oneLiner: true,
                inlineEnhancements: false,
                showHeader: true,
                noEmptyLines: false
            });
        });

        it('should show output container when cleaned result exists', () => {
            const options = {
                rosterInput: mockElements.rosterInput,
                outputContainer: mockElements.outputContainer,
                rosterOutput: mockElements.rosterOutput,
                showPointsCheckbox: mockElements.showPointsCheckbox,
                smartFormatCheckbox: mockElements.smartFormatCheckbox,
                showModelsCheckbox: mockElements.showModelsCheckbox,
                consolidateDuplicatesCheckbox: mockElements.consolidateDuplicatesCheckbox,
                oneLinerCheckbox: mockElements.oneLinerCheckbox,
                inlineEnhancementsCheckbox: mockElements.inlineEnhancementsCheckbox,
                showHeaderCheckbox: mockElements.showHeaderCheckbox,
                noEmptyLinesCheckbox: mockElements.noEmptyLinesCheckbox
            };

            options.rosterInput.value = 'test input';
            cleanRosterText.mockReturnValue('cleaned output');

            const updateRosterOutput = createUpdateRosterOutput(options);
            updateRosterOutput();

            expect(options.outputContainer.classList.contains('hidden')).toBe(false);
            expect(options.rosterOutput.textContent).toBe('cleaned output');
        });

        it('should hide output container when cleaned result is empty', () => {
            const options = {
                rosterInput: mockElements.rosterInput,
                outputContainer: mockElements.outputContainer,
                rosterOutput: mockElements.rosterOutput,
                showPointsCheckbox: mockElements.showPointsCheckbox,
                smartFormatCheckbox: mockElements.smartFormatCheckbox,
                showModelsCheckbox: mockElements.showModelsCheckbox,
                consolidateDuplicatesCheckbox: mockElements.consolidateDuplicatesCheckbox,
                oneLinerCheckbox: mockElements.oneLinerCheckbox,
                inlineEnhancementsCheckbox: mockElements.inlineEnhancementsCheckbox,
                showHeaderCheckbox: mockElements.showHeaderCheckbox,
                noEmptyLinesCheckbox: mockElements.noEmptyLinesCheckbox
            };

            options.rosterInput.value = '';
            cleanRosterText.mockReturnValue('');

            const updateRosterOutput = createUpdateRosterOutput(options);
            updateRosterOutput();

            expect(options.outputContainer.classList.contains('hidden')).toBe(true);
        });
    });

    describe('initializeApp', () => {
        it('should set up all event listeners and initialize the app', () => {
            initializeApp();

            expect(getDOMElements).toHaveBeenCalled();
            // Verify that input event listener was added
            expect(mockElements.rosterInput.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
        });

        it('should remove focus from roster input after pasting content', () => {
            // Mock the blur method
            const blurSpy = vi.spyOn(mockElements.rosterInput, 'blur');
            
            initializeApp();

            // Get the event listener function that was added
            const addEventListenerCall = mockElements.rosterInput.addEventListener.mock.calls.find(
                call => call[0] === 'input'
            );
            const inputEventListener = addEventListenerCall[1];

            // Simulate pasting content by calling the event listener directly
            mockElements.rosterInput.value = 'pasted content';
            inputEventListener();

            // Verify that blur was called to remove focus
            expect(blurSpy).toHaveBeenCalled();
        });

        it('should handle initialization errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            getDOMElements.mockImplementation(() => {
                throw new Error('DOM elements not found');
            });

            expect(() => initializeApp()).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize app:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('should copy roster output and show feedback when CMD/CTRL+C is pressed and nothing is focused', async () => {
            // Arrange
            initializeApp();

            // Mock navigator.platform to Mac
            Object.defineProperty(window.navigator, 'platform', { value: 'MacIntel', configurable: true });

            // Get the event listener for keydown
            const addEventListenerCall = window.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            );
            const keydownListener = addEventListenerCall ? addEventListenerCall[1] : null;
            expect(keydownListener).toBeInstanceOf(Function);

            // Set up DOM state: output visible, nothing focused
            mockElements.outputContainer.classList.remove('hidden');
            mockElements.copyButton.textContent = 'Copy';
            mockElements.discordFormatCheckbox.checked = false;
            mockElements.rosterOutput.textContent = 'cleaned output';
            document.activeElement.blur && document.activeElement.blur(); // Ensure nothing is focused

            // Act: simulate CMD/CTRL+C
            const event = new window.KeyboardEvent('keydown', {
                key: 'c',
                code: 'KeyC',
                metaKey: true, // Simulate CMD
                ctrlKey: false,
                bubbles: true,
                cancelable: true
            });
            await keydownListener(event);

            // Assert: copy logic called, feedback shown
            expect(copyToClipboard).toHaveBeenCalledWith('cleaned output');
            expect(mockElements.copyButton.textContent).toBe('Copied!');
        });
    });
}); 