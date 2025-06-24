import { normalizeApostrophes, normalizeFactionName } from './utils/string-utils.js';
import { ROSTER_CONFIG } from './config/roster-constants.js';
import {
    validateString,
    validateBoolean,
    validateStringArray,
    validateArrayIndex
} from './utils/validation-utils.js';
import {
    POINTS_PATTERN,
    ENHANCEMENT_PATTERN,
    POINTS_REMOVAL_PATTERN,
    BATTLESUIT_PATTERN,
    COMMANDER_PATTERN,
    MULTIPLE_S_PATTERN
} from './utils/regex-patterns.js';

/**
 * Checks if a line is a section header (fully capitalized text)
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line is a section header
 */
const isKnownSectionHeader = (line) => {
    const trimmedLine = line.trim();
    return trimmedLine && trimmedLine === trimmedLine.toUpperCase() && !trimmedLine.match(/[0-9]/);
};

/**
 * Checks if a line contains points information
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line contains points information
 */
const isPointsLine = (line) => line.match(POINTS_PATTERN);

/**
 * Checks if a line contains game format information
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line contains game format information
 */
const isGameFormatLine = (line) => 
    ROSTER_CONFIG.GAME_FORMATS.some(format => line.includes(format));

/**
 * Checks if a line contains army information
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line contains army information
 */
const isArmyInfoLine = (line) => 
    line && 
    !isPointsLine(line) && 
    !line.includes('•') && 
    !line.includes('◦') && 
    !line.includes('x') && 
    !line.match(/\d/) &&
    !line.includes('Exported with');

/**
 * Processes the army header section of the roster
 * @param {string[]} lines - Array of roster lines
 * @returns {{ armyInfo: string[], firstPointsLine: string|null, headerEndIndex: number }}
 */
function processArmyHeader(lines) {
    validateProcessArmyHeaderInput(lines);
    const armyInfo = [];
    let firstPointsLine = null;
    let headerEndIndex = 0;
    let firstPointsLineFound = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (isKnownSectionHeader(line)) continue;

        if (!firstPointsLineFound && isPointsLine(line)) {
            firstPointsLine = line;
            firstPointsLineFound = true;
            headerEndIndex = i + 1;
            continue;
        }

        if (isPointsLine(line) || isGameFormatLine(line)) continue;

        if (isArmyInfoLine(line)) {
            const modifiedLine = line.replace(/^Space Marines$/, 'SM');
            armyInfo.push(modifiedLine);
        }
    }

    return { armyInfo, firstPointsLine, headerEndIndex };
}

/**
 * Formats a unit name according to faction-specific rules
 * @param {string} unitName - The unit name to format
 * @param {boolean} isTauEmpire - Whether the unit belongs to T'au Empire
 * @param {boolean} smartFormat - Whether to apply smart formatting
 * @param {boolean} isChaosSpaceMarines - Whether the unit belongs to Chaos Space Marines
 * @returns {string} - Formatted unit name
 */
function formatUnitName(unitName, isTauEmpire, smartFormat, isChaosSpaceMarines) {
    validateFormatUnitNameInput(unitName, isTauEmpire, smartFormat);
    if (!smartFormat) return unitName;

    let formattedName = unitName;

    // Space Marines specific formatting
    if (formattedName.endsWith(' Squad')) {
        const baseName = formattedName.slice(0, -6);
        formattedName = baseName.endsWith('s') ? baseName : baseName + 's';
    }

    // Chaos Space Marines specific formatting
    if (isChaosSpaceMarines) {
        if (formattedName.startsWith('Chaos ')) {
            formattedName = formattedName.slice(6);
        }
        if (formattedName === 'Cultist Mob') {
            formattedName = 'Cultists';
        }
    }

    // T'au Empire specific formatting
    if (isTauEmpire) {
        formattedName = formatTauUnitName(formattedName);
    }

    return formattedName;
}

/**
 * Formats a T'au Empire unit name according to faction conventions
 * @param {string} unitName - The unit name to format
 * @returns {string} - Formatted unit name
 */
function formatTauUnitName(unitName) {
    validateFormatTauUnitNameInput(unitName);
    let formatted = unitName
        .replace(/Battlesuit/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    let battlesuitsMatch = formatted.match(BATTLESUIT_PATTERN);
    if (battlesuitsMatch) {
        let base = battlesuitsMatch[1].trim();
        formatted = base.endsWith('s') ? base : base + 's';
    }

    formatted = formatted
        .replace(COMMANDER_PATTERN, '')
        .trim();

    if (ROSTER_CONFIG.TAU_UNIT_BASES.includes(formatted)) {
        formatted = formatted + 's';
    }

    return formatted.replace(MULTIPLE_S_PATTERN, 's');
}

/**
 * Counts the number of models in a unit by analyzing its indentation structure
 * @param {string[]} lines - Array of roster lines
 * @param {number} startIndex - Starting index for the unit
 * @returns {number} - Total number of models in the unit
 */
function countModelsInUnit(lines, startIndex) {
    let modelCount = 0;
    const baseIndent = lines[startIndex].search(/\S|$/);
    let i = startIndex + 1;

    // Skip if this is a vehicle or character (single model)
    const unitName = lines[startIndex].split('(')[0].trim();
    if (unitName.match(/\b(Lord|Sorcerer|Rhino|Predator|Vindicator|Azrael|Captain|Chaplain|Lieutenant|Land Raider)\b/)) {
        return 1;
    }

    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim() || isKnownSectionHeader(line)) break;
        if (isPointsLine(line) || line.match(ENHANCEMENT_PATTERN)) {
            i++;
            continue;
        }

        const indent = line.search(/\S|$/);
        if (indent <= baseIndent) break;

        // Count all first-level bullets with '• Nx ...' as models, except known non-models
        if (indent === baseIndent + 2) {
            const modelMatch = line.match(/^\s*•\s*(\d+)x\s+([^•]+)/);
            if (modelMatch) {
                const modelName = modelMatch[2].trim();
                if (modelName === 'Watcher in the Dark') {
                    i++;
                    continue;
                }
                const count = parseInt(modelMatch[1], 10);
                modelCount += count;
            }
        }
        i++;
    }

    // If no models were counted, assume this is a single-model unit
    return modelCount || 1;
}

/**
 * Options for processing units
 * @typedef {Object} ProcessUnitsOptions
 * @property {string[]} lines - Array of roster lines
 * @property {number} startIndex - Starting index for processing
 * @property {boolean} showPoints - Whether to include points in output
 * @property {boolean} smartFormat - Whether to apply smart formatting
 * @property {boolean} isTauEmpire - Whether the roster is for T'au Empire
 * @property {boolean} isChaosSpaceMarines - Whether the roster is for Chaos Space Marines
 * @property {boolean} [showModels=false] - Whether to show model counts
 */

/**
 * Processes units in the roster according to specified options
 * @param {ProcessUnitsOptions} options - The options for processing units
 * @returns {string[]} - Array of processed unit lines
 */
function processUnits(options) {
    const {
        lines,
        startIndex,
        showPoints,
        smartFormat,
        isTauEmpire,
        isChaosSpaceMarines,
        showModels = false
    } = options;

    validateProcessUnitsInput(lines, startIndex, showPoints, smartFormat, isTauEmpire, isChaosSpaceMarines);
    const cleanedLines = [];
    let currentUnit = '';
    let currentPoints = '';
    let lastUnit = '';
    let currentUnitAdded = false;
    let headerProcessed = false;
    let currentUnitStartIndex = startIndex;

    for (let i = startIndex; i < lines.length; i++) {
        let line = normalizeApostrophes(lines[i].trim());
        if (!line) continue;

        if (isKnownSectionHeader(line)) continue;

        if (!headerProcessed) {
            if (isPointsLine(line) && !line.includes('Strike Force')) {
                headerProcessed = true;
            } else {
                continue;
            }
        }

        const pointsMatch = line.match(POINTS_PATTERN);
        if (pointsMatch) {
            if (currentUnit && !currentUnitAdded) {
                if (lastUnit && lastUnit !== currentUnit) {
                    cleanedLines.push('');
                }
                const modelCount = showModels ? countModelsInUnit(lines, currentUnitStartIndex) : 0;
                const modelText = modelCount > 1 ? `${modelCount}x ` : '';
                cleanedLines.push(showPoints ? `${modelText}${currentUnit} (${currentPoints})` : `${modelText}${currentUnit}`);
                lastUnit = currentUnit;
            }

            let unitName = line.split('(')[0].trim();
            currentUnit = formatUnitName(unitName, isTauEmpire, smartFormat, isChaosSpaceMarines);
            currentPoints = pointsMatch[1];
            currentUnitAdded = false;
            currentUnitStartIndex = i;
        } else if (line.match(ENHANCEMENT_PATTERN)) {
            const enhancement = line.split(ENHANCEMENT_PATTERN)[1].trim();
            if (currentUnit && !currentUnitAdded) {
                if (lastUnit && lastUnit !== currentUnit) {
                    cleanedLines.push('');
                }
                const modelCount = showModels ? countModelsInUnit(lines, currentUnitStartIndex) : 0;
                const modelText = modelCount > 1 ? `${modelCount}x ` : '';
                cleanedLines.push(showPoints ? `${modelText}${currentUnit} (${currentPoints})` : `${modelText}${currentUnit}`);
                cleanedLines.push(`  • Enhancement: ${enhancement}`);
                lastUnit = currentUnit;
                currentUnitAdded = true;
            }
        }
    }

    if (currentUnit && !currentUnitAdded) {
        if (lastUnit && lastUnit !== currentUnit) {
            cleanedLines.push('');
        }
        const modelCount = showModels ? countModelsInUnit(lines, currentUnitStartIndex) : 0;
        const modelText = modelCount > 1 ? `${modelCount}x ` : '';
        cleanedLines.push(showPoints ? `${modelText}${currentUnit} (${currentPoints})` : `${modelText}${currentUnit}`);
    }

    return cleanedLines;
}

/**
 * Validates input parameters for the cleanRosterText function
 * @param {any} input - The input to validate
 * @param {any} showPoints - The showPoints parameter to validate
 * @param {any} smartFormat - The smartFormat parameter to validate
 * @param {any} showModels - The showModels parameter to validate
 * @throws {Error} If any parameter is invalid
 */
function validateCleanRosterInput(input, showPoints, smartFormat, showModels) {
    validateString(input, 'input');
    validateBoolean(showPoints, 'showPoints');
    validateBoolean(smartFormat, 'smartFormat');
    validateBoolean(showModels, 'showModels');
}

/**
 * Validates input parameters for the processUnits function
 * @param {any} lines - The lines array to validate
 * @param {any} startIndex - The startIndex to validate
 * @param {any} showPoints - The showPoints parameter to validate
 * @param {any} smartFormat - The smartFormat parameter to validate
 * @param {any} isTauEmpire - The isTauEmpire parameter to validate
 * @param {any} isChaosSpaceMarines - The isChaosSpaceMarines parameter to validate
 * @throws {Error} If any parameter is invalid
 */
function validateProcessUnitsInput(lines, startIndex, showPoints, smartFormat, isTauEmpire, isChaosSpaceMarines) {
    validateStringArray(lines, 'lines');
    validateArrayIndex(startIndex, 'startIndex', lines.length);
    validateBoolean(showPoints, 'showPoints');
    validateBoolean(smartFormat, 'smartFormat');
    validateBoolean(isTauEmpire, 'isTauEmpire');
    validateBoolean(isChaosSpaceMarines, 'isChaosSpaceMarines');
}

/**
 * Validates input parameters for the formatUnitName function
 * @param {any} unitName - The unit name to validate
 * @param {any} isTauEmpire - The isTauEmpire parameter to validate
 * @param {any} smartFormat - The smartFormat parameter to validate
 * @throws {Error} If any parameter is invalid
 */
function validateFormatUnitNameInput(unitName, isTauEmpire, smartFormat) {
    validateString(unitName, 'unitName');
    validateBoolean(isTauEmpire, 'isTauEmpire');
    validateBoolean(smartFormat, 'smartFormat');
}

/**
 * Validates input parameters for the formatTauUnitName function
 * @param {any} unitName - The unit name to validate
 * @throws {Error} If the parameter is invalid
 */
function validateFormatTauUnitNameInput(unitName) {
    validateString(unitName, 'unitName');
}

/**
 * Validates input parameters for the processArmyHeader function
 * @param {any} lines - The lines array to validate
 * @throws {Error} If the parameter is invalid
 */
function validateProcessArmyHeaderInput(lines) {
    validateStringArray(lines, 'lines');
}

/**
 * Options for cleaning roster text
 * @typedef {Object} CleanRosterOptions
 * @property {string} input - The roster text to clean
 * @property {boolean} [showPoints=true] - Whether to include points in the output
 * @property {boolean} [smartFormat=true] - Whether to apply smart formatting to unit names
 * @property {boolean} [showModels=false] - Whether to show model counts
 */

/**
 * Cleans and formats a roster text according to specified options
 * @param {CleanRosterOptions} options - The options for cleaning the roster
 * @returns {string} - The cleaned roster text
 * @throws {Error} If any parameter is invalid
 */
function cleanRosterText(options) {
    const {
        input,
        showPoints = true,
        smartFormat = true,
        showModels = false
    } = options;

    validateCleanRosterInput(input, showPoints, smartFormat, showModels);

    const trimmedInput = input.trim();
    if (!trimmedInput) return '';

    const lines = trimmedInput.split('\n');
    const cleanedLines = [];

    // Process header
    const { armyInfo, firstPointsLine, headerEndIndex } = processArmyHeader(lines);
    
    if (firstPointsLine) {
        cleanedLines.push(showPoints ? firstPointsLine : firstPointsLine.replace(POINTS_REMOVAL_PATTERN, ''));
    }

    if (armyInfo.length > 0) {
        cleanedLines.push(armyInfo.join(' - '));
        cleanedLines.push('');
    }

    const isTauEmpire = armyInfo.some(line => 
        normalizeFactionName(line).includes('tauempire')
    );
    const isChaosSpaceMarines = armyInfo.some(line => 
        normalizeFactionName(line).includes('chaosspacemarines')
    );

    // Process units
    const unitLines = processUnits({
        lines,
        startIndex: headerEndIndex,
        showPoints,
        smartFormat,
        isTauEmpire,
        isChaosSpaceMarines,
        showModels
    });
    cleanedLines.push(...unitLines);

    return normalizeApostrophes(cleanedLines.join('\n'));
}

// Ensure only one export block at the end
export {
    cleanRosterText,
    normalizeApostrophes,
    normalizeFactionName,
    isKnownSectionHeader,
    isPointsLine,
    isGameFormatLine,
    isArmyInfoLine,
    processArmyHeader,
    formatUnitName,
    formatTauUnitName,
    processUnits
}; 