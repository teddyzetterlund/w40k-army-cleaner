/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
    FORMATTING_OPTIONS: '40k-army-cleaner-formatting-options'
};

/**
 * Default formatting options that match the initial state of checkboxes in the UI
 * @returns {object} Default formatting options
 */
export function getDefaultFormattingOptions() {
    return {
        showHeader: true,
        showPoints: true,
        showModels: false,
        inlineEnhancements: true,
        smartFormat: true,
        consolidateDuplicates: false,
        noEmptyLines: false,
        oneLiner: false,
        discordFormat: false
    };
}

/**
 * Saves formatting options to localStorage
 * @param {object} options - The formatting options to save
 * @param {boolean} options.showHeader - Whether to show roster header
 * @param {boolean} options.showPoints - Whether to show unit points
 * @param {boolean} options.showModels - Whether to show model counts
 * @param {boolean} options.inlineEnhancements - Whether to use inline enhancements
 * @param {boolean} options.smartFormat - Whether to use smart unit formatting
 * @param {boolean} options.consolidateDuplicates - Whether to merge duplicate units
 * @param {boolean} options.noEmptyLines - Whether to remove empty lines
 * @param {boolean} options.oneLiner - Whether to format as one line
 * @param {boolean} options.discordFormat - Whether to use Discord-friendly format
 */
export function saveFormattingOptions(options) {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(
                STORAGE_KEYS.FORMATTING_OPTIONS,
                JSON.stringify(options)
            );
        }
    } catch (error) {
        // Silently handle localStorage errors (quota exceeded, private browsing, etc.)
        console.warn('Failed to save formatting options to localStorage:', error);
    }
}

/**
 * Loads formatting options from localStorage, falling back to defaults if not available
 * @returns {object} The loaded formatting options
 */
export function loadFormattingOptions() {
    const defaultOptions = getDefaultFormattingOptions();
    
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const saved = window.localStorage.getItem(STORAGE_KEYS.FORMATTING_OPTIONS);
            
            if (saved) {
                const parsedOptions = JSON.parse(saved);
                
                // Merge with defaults to handle partial data or new options
                return { ...defaultOptions, ...parsedOptions };
            }
        }
    } catch (error) {
        // Silently handle localStorage errors (private browsing, corrupted data, etc.)
        console.warn('Failed to load formatting options from localStorage:', error);
    }
    
    return defaultOptions;
} 