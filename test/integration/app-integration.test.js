import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initializeApp } from '../../app.js';
import { cleanRosterText } from '../../roster-cleaner.js';
import { 
    getDOMElements, 
    updateOptionsButtonText, 
    readFileAsText, 
    copyToClipboard 
} from '../../utils/dom-utils.js';

// Mock dependencies
vi.mock('../../roster-cleaner.js');
vi.mock('../../utils/dom-utils.js');
vi.mock('../../utils/validation-utils.js');
vi.mock('../../config/ui-constants.js', () => ({
    UI_CONSTANTS: {
        DRAG_OVER_CLASS: 'drag-over',
        HIDDEN_CLASS: 'hidden',
        COPY_SUCCESS_TEXT: 'Copied!',
        COPY_FEEDBACK_DURATION_MS: 2000,
        OPTIONS_BUTTON_TEXT_FORMAT: 'Formatting ({checked}/{total})'
    }
}));

describe('App Integration Tests', () => {
    let mockElements;
    let originalDocument;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        
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
            discordFormatCheckbox: document.createElement('input'),
            hideHeaderCheckbox: document.createElement('input'),
            noEmptyLinesCheckbox: document.createElement('input'),
            optionsMenuButton: document.createElement('button'),
            optionsMenu: document.createElement('div')
        };

        // Set up checkbox types and initial states
        mockElements.showPointsCheckbox.type = 'checkbox';
        mockElements.smartFormatCheckbox.type = 'checkbox';
        mockElements.showModelsCheckbox.type = 'checkbox';
        mockElements.consolidateDuplicatesCheckbox.type = 'checkbox';
        mockElements.oneLinerCheckbox.type = 'checkbox';
        mockElements.inlineEnhancementsCheckbox.type = 'checkbox';
        mockElements.discordFormatCheckbox.type = 'checkbox';
        mockElements.hideHeaderCheckbox.type = 'checkbox';
        mockElements.noEmptyLinesCheckbox.type = 'checkbox';

        // Set default states
        mockElements.showPointsCheckbox.checked = true;
        mockElements.smartFormatCheckbox.checked = true;
        mockElements.showModelsCheckbox.checked = false;
        mockElements.consolidateDuplicatesCheckbox.checked = false;
        mockElements.oneLinerCheckbox.checked = false;
        mockElements.inlineEnhancementsCheckbox.checked = true;
        mockElements.discordFormatCheckbox.checked = false;
        mockElements.hideHeaderCheckbox.checked = false;
        mockElements.noEmptyLinesCheckbox.checked = false;

        // Set initial menu state to hidden
        mockElements.optionsMenu.classList.add('hidden');

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

        // Store original document methods
        originalDocument = {
            addEventListener: document.addEventListener,
            dispatchEvent: document.dispatchEvent
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        // Restore original document methods
        document.addEventListener = originalDocument.addEventListener;
        document.dispatchEvent = originalDocument.dispatchEvent;
    });

    describe('Complete User Workflow', () => {
        it('should handle complete roster cleaning workflow', () => {
            // Initialize app
            initializeApp();

            // Simulate user typing in roster input
            mockElements.rosterInput.value = 'test roster input';
            mockElements.rosterInput.dispatchEvent(new Event('input'));

            // Verify cleanRosterText was called with correct parameters
            expect(cleanRosterText).toHaveBeenCalledWith({
                input: 'test roster input',
                showPoints: true,
                smartFormat: true,
                showModels: false,
                consolidateDuplicates: false,
                oneLiner: false,
                inlineEnhancements: true,
                hideHeader: false,
                noEmptyLines: false
            });

            // Verify output is displayed
            expect(mockElements.outputContainer.classList.contains('hidden')).toBe(false);
            expect(mockElements.rosterOutput.textContent).toBe('cleaned roster output');
        });

        it('should handle checkbox option changes', () => {
            // Initialize app
            initializeApp();

            // Simulate user changing options
            mockElements.showPointsCheckbox.checked = false;
            mockElements.smartFormatCheckbox.checked = false;
            mockElements.consolidateDuplicatesCheckbox.checked = true;
            mockElements.oneLinerCheckbox.checked = true;

            // Trigger change events
            mockElements.showPointsCheckbox.dispatchEvent(new Event('change'));
            mockElements.smartFormatCheckbox.dispatchEvent(new Event('change'));
            mockElements.consolidateDuplicatesCheckbox.dispatchEvent(new Event('change'));
            mockElements.oneLinerCheckbox.dispatchEvent(new Event('change'));

            // Verify cleanRosterText was called with updated parameters
            expect(cleanRosterText).toHaveBeenCalledWith({
                input: '',
                showPoints: false,
                smartFormat: false,
                showModels: false,
                consolidateDuplicates: true,
                oneLiner: true,
                inlineEnhancements: true,
                hideHeader: false,
                noEmptyLines: false
            });

            // Verify options button text was updated (5 times: 4 changes + 1 initial setup)
            expect(updateOptionsButtonText).toHaveBeenCalledTimes(5);
        });

        it('should handle file drag and drop workflow', () => {
            // Initialize app
            initializeApp();

            // Simulate file drop
            const dropEvent = new Event('drop');
            dropEvent.dataTransfer = {
                files: [new File(['roster content'], 'roster.txt', { type: 'text/plain' })]
            };

            mockElements.rosterInput.dispatchEvent(dropEvent);

            // Verify file was read and roster was updated
            expect(readFileAsText).toHaveBeenCalled();
            expect(cleanRosterText).toHaveBeenCalledWith({
                input: 'file content',
                showPoints: true,
                smartFormat: true,
                showModels: false,
                consolidateDuplicates: false,
                oneLiner: false,
                inlineEnhancements: true,
                hideHeader: false,
                noEmptyLines: false
            });
        });

        it('should handle copy to clipboard workflow', async () => {
            // Initialize app
            initializeApp();

            // Set up output content
            mockElements.rosterOutput.textContent = 'roster to copy';
            const originalText = mockElements.copyButton.textContent;

            // Simulate copy button click
            await mockElements.copyButton.dispatchEvent(new Event('click'));

            // Verify clipboard was called
            expect(copyToClipboard).toHaveBeenCalledWith('roster to copy');

            // Verify success feedback
            expect(mockElements.copyButton.textContent).toBe('Copied!');

            // Wait for timeout and verify original text restored
            await new Promise(resolve => setTimeout(resolve, 2100));
            expect(mockElements.copyButton.textContent).toBe(originalText);
        });

        it('should handle options menu interaction workflow', () => {
            // Initialize app
            initializeApp();

            // Simulate opening options menu
            mockElements.optionsMenuButton.dispatchEvent(new Event('click'));
            expect(mockElements.optionsMenu.classList.contains('hidden')).toBe(false);

            // Simulate clicking inside menu (should not close)
            mockElements.optionsMenu.dispatchEvent(new Event('click'));
            expect(mockElements.optionsMenu.classList.contains('hidden')).toBe(false);

            // Simulate clicking outside menu (should close)
            document.dispatchEvent(new Event('click'));
            expect(mockElements.optionsMenu.classList.contains('hidden')).toBe(true);
        });

        it('should handle empty input gracefully', () => {
            // Initialize app
            initializeApp();

            // Set empty input
            mockElements.rosterInput.value = '';
            cleanRosterText.mockReturnValue('');

            // Trigger input event
            mockElements.rosterInput.dispatchEvent(new Event('input'));

            // Verify output is hidden
            expect(mockElements.outputContainer.classList.contains('hidden')).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle file read errors gracefully', () => {
            // Initialize app
            initializeApp();

            // Mock file read error
            readFileAsText.mockImplementation((file, onLoad, onError) => {
                onError(new Error('File read failed'));
            });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Simulate file drop
            const dropEvent = new Event('drop');
            dropEvent.dataTransfer = {
                files: [new File(['content'], 'test.txt', { type: 'text/plain' })]
            };

            expect(() => mockElements.rosterInput.dispatchEvent(dropEvent)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith('Failed to read file:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('should handle copy errors gracefully', async () => {
            // Initialize app
            initializeApp();

            // Mock copy error
            copyToClipboard.mockRejectedValue(new Error('Copy failed'));

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Simulate copy button click
            await mockElements.copyButton.dispatchEvent(new Event('click'));

            expect(consoleSpy).toHaveBeenCalledWith('Copy failed:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('should handle initialization errors gracefully', () => {
            // Mock getDOMElements to throw error
            getDOMElements.mockImplementation(() => {
                throw new Error('DOM elements not found');
            });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => initializeApp()).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize app:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });
}); 