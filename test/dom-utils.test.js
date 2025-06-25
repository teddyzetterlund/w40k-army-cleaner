import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
    getDOMElements, 
    updateOptionsButtonText, 
    readFileAsText, 
    copyToClipboard,
    scrollToOutput,
    getKeyboardShortcutText
} from '../utils/dom-utils.js';

// Improved FileReader mock
let fileReaderInstance;
global.FileReader = vi.fn(() => {
    fileReaderInstance = {
        readAsText: vi.fn(function () {
            // no-op
        }),
        onload: null,
        onerror: null
    };
    return fileReaderInstance;
});

describe('DOM Utilities', () => {
    let mockElements;

    beforeEach(() => {
        // Mock DOM elements
        mockElements = {
            'roster-input': document.createElement('textarea'),
            'output-container': document.createElement('div'),
            'roster-output': document.createElement('div'),
            'copy-button': document.createElement('button'),
            'show-points': document.createElement('input'),
            'smart-format': document.createElement('input'),
            'show-models': document.createElement('input'),
            'consolidate-duplicates': document.createElement('input'),
            'one-liner': document.createElement('input'),
            'inline-enhancements': document.createElement('input'),
            'discord-format': document.createElement('input'),
            'show-header': document.createElement('input'),
            'no-empty-lines': document.createElement('input'),
            'options-menu-button': document.createElement('button'),
            'options-menu': document.createElement('div')
        };

        // Setup getElementById mock
        vi.spyOn(document, 'getElementById').mockImplementation((id) => {
            return mockElements[id] || null;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    describe('getDOMElements', () => {
        it('should return all required DOM elements when they exist', () => {
            const elements = getDOMElements();
            
            expect(elements.rosterInput).toBe(mockElements['roster-input']);
            expect(elements.outputContainer).toBe(mockElements['output-container']);
            expect(elements.rosterOutput).toBe(mockElements['roster-output']);
            expect(elements.copyButton).toBe(mockElements['copy-button']);
            expect(elements.showPointsCheckbox).toBe(mockElements['show-points']);
            expect(elements.smartFormatCheckbox).toBe(mockElements['smart-format']);
            expect(elements.showModelsCheckbox).toBe(mockElements['show-models']);
            expect(elements.consolidateDuplicatesCheckbox).toBe(mockElements['consolidate-duplicates']);
            expect(elements.oneLinerCheckbox).toBe(mockElements['one-liner']);
            expect(elements.inlineEnhancementsCheckbox).toBe(mockElements['inline-enhancements']);
            expect(elements.discordFormatCheckbox).toBe(mockElements['discord-format']);
            expect(elements.showHeaderCheckbox).toBe(mockElements['show-header']);
            expect(elements.noEmptyLinesCheckbox).toBe(mockElements['no-empty-lines']);
            expect(elements.optionsMenuButton).toBe(mockElements['options-menu-button']);
            expect(elements.optionsMenu).toBe(mockElements['options-menu']);
        });

        it('should throw error when required element is missing', () => {
            delete mockElements['roster-input'];
            
            expect(() => getDOMElements()).toThrow("Required DOM element 'rosterInput' not found");
        });
    });

    describe('updateOptionsButtonText', () => {
        it('should update button text with correct count when all checkboxes are checked', () => {
            const button = document.createElement('button');
            const checkboxes = [
                { checked: true },
                { checked: true },
                { checked: true },
                { checked: true },
                { checked: true },
                { checked: true }
            ];

            updateOptionsButtonText(button, checkboxes);
            
            expect(button.textContent).toBe('Formatting (6/6)');
        });

        it('should update button text with correct count when some checkboxes are checked', () => {
            const button = document.createElement('button');
            const checkboxes = [
                { checked: true },
                { checked: false },
                { checked: true },
                { checked: false },
                { checked: true },
                { checked: false }
            ];

            updateOptionsButtonText(button, checkboxes);
            
            expect(button.textContent).toBe('Formatting (3/6)');
        });

        it('should update button text with correct count when no checkboxes are checked', () => {
            const button = document.createElement('button');
            const checkboxes = [
                { checked: false },
                { checked: false },
                { checked: false },
                { checked: false },
                { checked: false },
                { checked: false }
            ];

            updateOptionsButtonText(button, checkboxes);
            
            expect(button.textContent).toBe('Formatting (0/6)');
        });

        it('should throw error when button is not a DOM element', () => {
            const checkboxes = [{ checked: true }];
            
            expect(() => updateOptionsButtonText(null, checkboxes)).toThrow('optionsMenuButton must be a DOM element');
        });
    });

    describe('readFileAsText', () => {
        it('should call onLoad with file content when file is read successfully', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
            const onLoad = vi.fn();
            const onError = vi.fn();

            readFileAsText(file, onLoad, onError);

            // Simulate FileReader success
            fileReaderInstance.onload({ target: { result: 'test content' } });

            expect(onLoad).toHaveBeenCalledWith('test content');
            expect(onError).not.toHaveBeenCalled();
        });

        it('should call onError when file reading fails', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
            const onLoad = vi.fn();
            const onError = vi.fn();

            readFileAsText(file, onLoad, onError);

            // Simulate FileReader error
            fileReaderInstance.onerror(new Error('Read error'));

            expect(onError).toHaveBeenCalled();
            expect(onLoad).not.toHaveBeenCalled();
        });

        it('should throw error when file is not a File object', () => {
            const onLoad = vi.fn();
            const onError = vi.fn();

            expect(() => readFileAsText('not a file', onLoad, onError)).toThrow('file must be a File object');
        });

        it('should throw error when onLoad is not a function', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
            const onError = vi.fn();

            expect(() => readFileAsText(file, 'not a function', onError)).toThrow('onLoad must be a function');
        });

        it('should throw error when onError is not a function', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
            const onLoad = vi.fn();

            expect(() => readFileAsText(file, onLoad, 'not a function')).toThrow('onError must be a function');
        });
    });

    describe('copyToClipboard', () => {
        beforeEach(() => {
            // Mock navigator.clipboard
            global.navigator.clipboard = {
                writeText: vi.fn()
            };
        });

        it('should copy text to clipboard successfully', async () => {
            const text = 'test text';
            navigator.clipboard.writeText.mockResolvedValue();

            await copyToClipboard(text);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
        });

        it('should throw error when clipboard API is not available', async () => {
            delete global.navigator.clipboard;

            await expect(copyToClipboard('test')).rejects.toThrow('Clipboard API not available');
        });

        it('should throw error when clipboard write fails', async () => {
            const error = new Error('Clipboard write failed');
            navigator.clipboard.writeText.mockRejectedValue(error);

            await expect(copyToClipboard('test')).rejects.toThrow('Failed to copy to clipboard: Clipboard write failed');
        });
    });

    describe('scrollToOutput', () => {
        let mockElement;
        let mockScrollIntoView;

        beforeEach(() => {
            mockScrollIntoView = vi.fn();
            mockElement = {
                scrollIntoView: mockScrollIntoView
            };
            // Mock the Element constructor to make our mock pass validation
            Object.setPrototypeOf(mockElement, Element.prototype);
        });

        it('should call scrollIntoView with smooth behavior', () => {
            scrollToOutput(mockElement);
            
            expect(mockScrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        });

        it('should throw error for invalid element', () => {
            expect(() => scrollToOutput(null)).toThrow('outputContainer must be a DOM element');
            expect(() => scrollToOutput(undefined)).toThrow('outputContainer must be a DOM element');
        });
    });

    describe('getKeyboardShortcutText', () => {
        let originalUserAgent;
        let originalPlatform;

        beforeEach(() => {
            // Store original values
            originalUserAgent = navigator.userAgent;
            originalPlatform = navigator.platform;
        });

        afterEach(() => {
            // Restore original values
            Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
            Object.defineProperty(navigator, 'platform', { value: originalPlatform, configurable: true });
        });

        it('should return (CMD+C) for Mac desktop', () => {
            Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', configurable: true });
            Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
            
            expect(getKeyboardShortcutText()).toBe(' (CMD+C)');
        });

        it('should return (CTRL+C) for Windows desktop', () => {
            Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', configurable: true });
            Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true });
            
            expect(getKeyboardShortcutText()).toBe(' (CTRL+C)');
        });

        it('should return (CMD+C) for iPad with Mac platform', () => {
            Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', configurable: true });
            Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
            
            expect(getKeyboardShortcutText()).toBe(' (CMD+C)');
        });

        it('should return empty string for iPhone', () => {
            Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', configurable: true });
            Object.defineProperty(navigator, 'platform', { value: 'iPhone', configurable: true });
            
            expect(getKeyboardShortcutText()).toBe('');
        });

        it('should return empty string for Android mobile', () => {
            Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36', configurable: true });
            Object.defineProperty(navigator, 'platform', { value: 'Linux armv8l', configurable: true });
            
            expect(getKeyboardShortcutText()).toBe('');
        });
    });
}); 