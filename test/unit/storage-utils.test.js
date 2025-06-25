import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    saveFormattingOptions, 
    loadFormattingOptions, 
    getDefaultFormattingOptions,
    STORAGE_KEYS 
} from '../../utils/storage-utils.js';

describe('storage-utils', () => {
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn()
        };
        
        // Replace global localStorage with mock
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });
    });

    describe('getDefaultFormattingOptions', () => {
        it('should return default formatting options', () => {
            const defaults = getDefaultFormattingOptions();
            
            expect(defaults).toEqual({
                showHeader: true,
                showPoints: true,
                showModels: false,
                inlineEnhancements: true,
                smartFormat: true,
                consolidateDuplicates: false,
                noEmptyLines: false,
                oneLiner: false,
                discordFormat: false
            });
        });
    });

    describe('saveFormattingOptions', () => {
        it('should save formatting options to localStorage', () => {
            const options = {
                showHeader: false,
                showPoints: true,
                showModels: true,
                inlineEnhancements: false,
                smartFormat: true,
                consolidateDuplicates: true,
                noEmptyLines: true,
                oneLiner: false,
                discordFormat: true
            };

            saveFormattingOptions(options);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.FORMATTING_OPTIONS,
                JSON.stringify(options)
            );
        });

        it('should handle localStorage errors gracefully', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            const options = getDefaultFormattingOptions();

            // Should not throw error
            expect(() => saveFormattingOptions(options)).not.toThrow();
        });
    });

    describe('loadFormattingOptions', () => {
        it('should load formatting options from localStorage', () => {
            const savedOptions = {
                showHeader: false,
                showPoints: true,
                showModels: true,
                inlineEnhancements: false,
                smartFormat: true,
                consolidateDuplicates: true,
                noEmptyLines: true,
                oneLiner: false,
                discordFormat: true
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedOptions));

            const loadedOptions = loadFormattingOptions();

            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.FORMATTING_OPTIONS);
            expect(loadedOptions).toEqual(savedOptions);
        });

        it('should return default options when localStorage is empty', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const loadedOptions = loadFormattingOptions();
            const defaultOptions = getDefaultFormattingOptions();

            expect(loadedOptions).toEqual(defaultOptions);
        });

        it('should return default options when localStorage contains invalid JSON', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid json');

            const loadedOptions = loadFormattingOptions();
            const defaultOptions = getDefaultFormattingOptions();

            expect(loadedOptions).toEqual(defaultOptions);
        });

        it('should return default options when localStorage contains partial data', () => {
            const partialOptions = {
                showHeader: false,
                showPoints: true
                // Missing other properties
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialOptions));

            const loadedOptions = loadFormattingOptions();
            const defaultOptions = getDefaultFormattingOptions();

            // Should merge partial data with defaults
            expect(loadedOptions.showHeader).toBe(false);
            expect(loadedOptions.showPoints).toBe(true);
            expect(loadedOptions.showModels).toBe(defaultOptions.showModels);
            expect(loadedOptions.smartFormat).toBe(defaultOptions.smartFormat);
        });

        it('should handle localStorage errors gracefully', () => {
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('Storage not available');
            });

            const loadedOptions = loadFormattingOptions();
            const defaultOptions = getDefaultFormattingOptions();

            expect(loadedOptions).toEqual(defaultOptions);
        });
    });

    describe('STORAGE_KEYS', () => {
        it('should export storage keys constant', () => {
            expect(STORAGE_KEYS).toEqual({
                FORMATTING_OPTIONS: '40k-army-cleaner-formatting-options'
            });
        });
    });
}); 