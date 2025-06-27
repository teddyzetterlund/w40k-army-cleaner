import { normalizeApostrophes, normalizeFactionName, getLineBeforePoints, getPointsPart } from './utils/string-utils.js';
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
    MULTIPLE_S_PATTERN,
    ENHANCEMENT_LINE_PATTERN
} from './utils/regex-patterns.js';

const NR_NR_ENHANCEMENTS = [
    'Bastion Plate',
    'Warp Tracer',
    // Add more known enhancements as needed
];

/**
 * Checks if a roster is in NewRecruit format by looking for the characteristic header structure
 * @param {string[]} lines - Array of roster lines
 * @returns {boolean} - True if the roster is in NewRecruit format
 */
const isNewRecruitFormat = (lines) => {
    if (lines.length < 3) return false;
    
    // Look for the characteristic NewRecruit header pattern
    const firstLine = lines[0].trim();
    const secondLine = lines[1].trim();
    
    return firstLine.startsWith('+') && 
           firstLine.endsWith('+') && 
           secondLine.startsWith('+ FACTION KEYWORD:');
};

/**
 * Extracts army information from NewRecruit format header
 * @param {string[]} lines - Array of roster lines
 * @returns {{ armyInfo: string[], firstPointsLine: string|null, headerEndIndex: number }}
 */
function processNewRecruitHeader(lines) {
    const armyInfo = [];
    let firstPointsLine = null;
    let headerEndIndex = 0;
    let faction = '';
    let detachment = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Skip the border lines (just + characters)
        if (line.match(/^\++$/)) continue;

        // Extract faction keyword
        if (line.startsWith('+ FACTION KEYWORD:')) {
            const factionMatch = line.match(/\+ FACTION KEYWORD:\s*(.+)/);
            if (factionMatch) {
                // Use only the last part after the last dash for the main faction
                const fullFaction = factionMatch[1].trim().replace(/\s*-\s*$/, '');
                const parts = fullFaction.split('-').map(s => s.trim());
                faction = parts.length > 1 ? parts[parts.length - 1] : parts[0];
            }
        }

        // Extract detachment
        if (line.startsWith('+ DETACHMENT:')) {
            const detachmentMatch = line.match(/\+ DETACHMENT:\s*(.+)/);
            if (detachmentMatch) {
                detachment = detachmentMatch[1].trim();
            }
        }

        // Extract total points
        if (line.startsWith('+ TOTAL ARMY POINTS:')) {
            const pointsMatch = line.match(/\+ TOTAL ARMY POINTS:\s*(\d+)pts/);
            if (pointsMatch) {
                const points = pointsMatch[1];
                firstPointsLine = `The Goal is to Survive the Shooting Phase  (${points} points)`;
            }
        }

        // Find the end of the header (after the closing + line)
        if (line.startsWith('+') && line.endsWith('+') && i > 0) {
            headerEndIndex = i + 1;
            break;
        }
    }

    // Join faction and detachment with ' - ' if both exist
    if (faction && detachment) {
        armyInfo.push(`${faction} - ${detachment}`);
    } else if (faction) {
        armyInfo.push(faction);
    } else if (detachment) {
        armyInfo.push(detachment);
    }

    return { armyInfo, firstPointsLine, headerEndIndex };
}

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
 * Checks if a line contains NewRecruit points information (format: "1x Unit Name (points pts)" or "Char1: 1x Unit Name (points pts)")
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line contains NewRecruit points information
 */
const isNewRecruitPointsLine = (line) => line.match(/^(?:Char\d+:\s*)?\d+x\s+.+\(\d+\s*pts\)/);

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
 * Checks if a line contains NewRecruit enhancement information (format: "• Enhancement Name (+points pts)")
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line contains NewRecruit enhancement information
 */
const isNewRecruitEnhancementLine = (line) => line.match(/^\s*•\s+([^(]+)\s+\(\+\d+\s*pts\)/);

/**
 * Processes the army header section of the roster
 * @param {string[]} lines - Array of roster lines
 * @returns {{ armyInfo: string[], firstPointsLine: string|null, headerEndIndex: number }}
 */
function processArmyHeader(lines) {
    validateProcessArmyHeaderInput(lines);
    
    // Check if this is NewRecruit format
    if (isNewRecruitFormat(lines)) {
        return processNewRecruitHeader(lines);
    }
    
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

    // Remove 'Chaos ' prefix for smart formatting
    if (formattedName.startsWith('Chaos ')) {
        formattedName = formattedName.slice(6);
    }

    // Space Marines specific formatting
    if (formattedName.endsWith(' Squad')) {
        const baseName = formattedName.slice(0, -6);
        formattedName = baseName.endsWith('s') ? baseName : baseName + 's';
    }

    // Special case for Terminator Squad/Terminators
    if (formattedName === 'Terminator Squad') {
        formattedName = 'Terminators';
    }
    if (formattedName === 'Chaos Terminator Squad') {
        formattedName = 'Terminators';
    }

    // Chaos Space Marines specific formatting
    if (isChaosSpaceMarines) {
        if (formattedName === 'Cultist Mob') {
            formattedName = 'Cultists';
        }
        if (formattedName === 'Rhino' || formattedName === 'Chaos Rhino') {
            formattedName = 'Rhino';
        }
        if (formattedName === 'Predator Annihilator' || formattedName === 'Chaos Predator Annihilator') {
            formattedName = 'Predator Annihilator';
        }
        if (formattedName === 'Vindicator' || formattedName === 'Chaos Vindicator') {
            formattedName = 'Vindicator';
        }
        if (formattedName === 'Possessed') {
            formattedName = 'Possessed';
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

    const battlesuitsMatch = formatted.match(BATTLESUIT_PATTERN);
    if (battlesuitsMatch) {
        const base = battlesuitsMatch[1].trim();
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
 * Helper: Extract model count from a character line (e.g., 'Char1: 3x ...')
 * @param {string} line
 * @returns {number|null}
 */
function getCharacterLineModelCount(line) {
    const charMatch = line.match(/^Char\d+:\s*(\d+)x\s+/);
    return charMatch ? parseInt(charMatch[1], 10) : null;
}

/**
 * Helper: Extract model count from a regular unit line (e.g., '2x Cryptothralls ...')
 * @param {string} line
 * @returns {number|null}
 */
function getRegularUnitLineModelCount(line) {
    const wtcMatch = line.match(/^(\d+)x\s+/);
    return wtcMatch ? parseInt(wtcMatch[1], 10) : null;
}

/**
 * Helper: Count models from bullet points under a unit
 * @param {string[]} lines
 * @param {number} startIndex
 * @returns {number}
 */
function getBulletPointModelCount(lines, startIndex) {
    let modelCount = 0;
    let i = startIndex + 1;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim() || isKnownSectionHeader(line)) break;
        if (isNewRecruitPointsLine(line) || line.match(ENHANCEMENT_PATTERN)) {
            i++;
            continue;
        }
        const bulletMatch = line.match(/^\s*•\s*(\d+)x\s+([^•]+)/);
        if (bulletMatch) {
            const count = parseInt(bulletMatch[1], 10);
            // Check if this line is followed by more indented wargear lines
            let hasWargear = false;
            let j = i + 1;
            while (j < lines.length) {
                const nextLine = lines[j];
                if (!nextLine.trim() || isKnownSectionHeader(nextLine)) break;
                if (isNewRecruitPointsLine(nextLine) || nextLine.match(ENHANCEMENT_PATTERN)) break;
                const currentIndent = line.search(/•/);
                const nextIndent = nextLine.search(/•/);
                if (nextIndent <= currentIndent) break;
                if (nextIndent > currentIndent) {
                    hasWargear = true;
                    break;
                }
                j++;
            }
            if (hasWargear) {
                modelCount += count;
            }
        }
        i++;
    }
    return modelCount;
}

/**
 * Counts the number of models in a NewRecruit format unit
 * @param {string[]} lines
 * @param {number} startIndex
 * @returns {number}
 */
function countModelsInNewRecruitUnit(lines, startIndex) {
    const currentLine = lines[startIndex];
    // 1. Character line
    const charCount = getCharacterLineModelCount(currentLine);
    if (charCount !== null) return charCount;
    // 2. Regular unit line
    const unitCount = getRegularUnitLineModelCount(currentLine);
    if (unitCount !== null) return unitCount;
    // 3. Bullet points
    const bulletCount = getBulletPointModelCount(lines, startIndex);
    return bulletCount || 1;
}

/**
 * Helper: Count models from NR-NR bullet points under a unit
 * @param {string[]} lines
 * @param {number} startIndex
 * @returns {number}
 */
function getNRBulletPointModelCount(lines, startIndex) {
    let modelCount = 0;
    let i = startIndex + 1;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim() || line.startsWith('##') || line.match(/^[\w\s\-]+ \[\d+ pts\]:/)) break;
        const bulletMatch = line.match(/^\s*•\s*(\d+)x\s+([^:]+)/);
        if (bulletMatch) {
            const count = parseInt(bulletMatch[1], 10);
            modelCount += count;
        }
        i++;
    }
    return modelCount;
}

/**
 * Counts the number of models in a NewRecruit NR format unit
 * @param {string[]} lines
 * @param {number} startIndex
 * @returns {number}
 */
function countModelsInNewRecruitNRUnit(lines, startIndex) {
    const bulletCount = getNRBulletPointModelCount(lines, startIndex);
    return bulletCount || 1;
}

/**
 * Helper: Count models by indentation for non-NewRecruit formats
 * @param {string[]} lines
 * @param {number} startIndex
 * @returns {number}
 */
function getIndentedModelCount(lines, startIndex) {
    let modelCount = 0;
    const baseIndent = lines[startIndex].search(/\S|$/);
    let i = startIndex + 1;
    let firstLevelIndent = null;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim() || isKnownSectionHeader(line)) break;
        if (isPointsLine(line) || line.match(ENHANCEMENT_PATTERN)) {
            i++;
            continue;
        }
        const indent = line.search(/\S|$/);
        if (indent <= baseIndent) break;
        if (firstLevelIndent === null) {
            firstLevelIndent = indent;
        }
        if (indent === firstLevelIndent) {
            const modelMatch = line.match(/^\s*•\s*(\d+)x\s+([^•]+)/);
            if (modelMatch) {
                const count = parseInt(modelMatch[1], 10);
                // Check if this line is followed by more indented wargear lines
                let hasWargear = false;
                let j = i + 1;
                while (j < lines.length) {
                    const nextLine = lines[j];
                    if (!nextLine.trim() || isKnownSectionHeader(nextLine)) break;
                    if (isPointsLine(nextLine) || nextLine.match(ENHANCEMENT_PATTERN)) break;
                    const nextIndent = nextLine.search(/\S|$/);
                    if (nextIndent <= indent) break;
                    if (nextIndent > indent) {
                        hasWargear = true;
                        break;
                    }
                    j++;
                }
                if (hasWargear) {
                    modelCount += count;
                }
            }
        }
        i++;
    }
    return modelCount;
}

/**
 * Counts the number of models in a unit by analyzing the structure of indented lines.
 * Delegates to NewRecruit helpers if format matches.
 * @param {string[]} lines
 * @param {number} startIndex
 * @returns {number}
 */
function countModelsInUnit(lines, startIndex) {
    if (isNewRecruitFormat(lines)) {
        return countModelsInNewRecruitUnit(lines, startIndex);
    }
    if (isNewRecruitNRFormat(lines)) {
        return countModelsInNewRecruitNRUnit(lines, startIndex);
    }
    const indentedCount = getIndentedModelCount(lines, startIndex);
    return indentedCount || 1;
}

/**
 * Extracts enhancement name from a line (handles all supported formats)
 * @param {string} line
 * @returns {string|null}
 */
function extractEnhancement(line) {
    if (line.match(ENHANCEMENT_PATTERN)) {
        // e.g. "Enhancement: Dread Majesty (+30 pts)"
        const enhancement = line.split(ENHANCEMENT_PATTERN)[1].trim();
        return enhancement.replace(/\s*\([^)]*\)/, '') || null;
    }
    if (isNewRecruitEnhancementLine(line)) {
        // e.g. "• Dread Majesty (+30 pts)"
        const match = line.match(/^\s*•\s+([^(]+)\s+\(\+\d+\s*pts\)/);
        return match ? match[1].trim() : null;
    }
    if (line.match(/^Enhancement:\s+([^(]+)\s+\(\+\d+\s*pts\)/)) {
        // e.g. "Enhancement: Dread Majesty (+30 pts)"
        const match = line.match(/^Enhancement:\s+([^(]+)\s+\(\+\d+\s*pts\)/);
        return match ? match[1].trim().replace(/\s*\(\+\d+\s*pts\)/, '') : null;
    }
    return null;
}

/**
 * Parses a NewRecruit unit line (e.g., "Char1: 3x The Silent King (420 pts): ...")
 * @param {string} line
 * @returns {{ unitName: string, points: string, rawMatch: RegExpMatchArray } | null}
 */
function parseNewRecruitUnitLine(line) {
    const match = line.match(/^(?:Char\d+:\s*)?(\d+)x\s+(.+?)\s+\((\d+)\s*pts\)/);
    if (!match) return null;
    return {
        unitName: match[2].trim(),
        points: match[3],
        rawMatch: match
    };
}

/**
 * Parses a GW unit line (e.g., "Lord in Terminator Armour (105 Points)")
 * @param {string} line
 * @returns {{ unitName: string, points: string, rawMatch: RegExpMatchArray } | null}
 */
function parseGWUnitLine(line) {
    const match = line.match(/^(.+?)\s*\((\d+)\s*Points?\)/i);
    if (!match) return null;
    return {
        unitName: match[1].trim(),
        points: match[2],
        rawMatch: match
    };
}

/**
 * Formats the model count prefix for a unit line.
 * Returns "3x " for 3 models, "" for 0 or 1.
 * @param {number} modelCount
 * @returns {string}
 */
function formatModelCountPrefix(modelCount) {
    return modelCount > 1 ? `${modelCount}x ` : '';
}

/**
 * Options for processing units
 * @typedef {object} ProcessUnitsOptions
 * @property {string[]} lines - Array of roster lines
 * @property {number} startIndex - Starting index for processing
 * @property {boolean} showPoints - Whether to include points in output
 * @property {boolean} smartFormat - Whether to apply smart formatting
 * @property {boolean} isTauEmpire - Whether the roster is for T'au Empire
 * @property {boolean} isChaosSpaceMarines - Whether the roster is for Chaos Space Marines
 * @property {boolean} [showModels=false] - Whether to show model counts
 */

/**
 * Processes units in the roster according to specified options.
 *
 * Output rules:
 * - Blank line only between groups of different units (not between consecutive identical units)
 * - No blank line after the last unit
 * - Enhancements always follow the unit they belong to
 * - Ignore enhancements in headers or before the first unit
 * - Only consecutive identical units are consolidated
 * - Never more than one blank line in a row
 *
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
    const isNewRecruit = isNewRecruitFormat(lines);
    const cleanedLines = [];
    let prevUnitName = null;
    let currentUnit = null;
    let currentPoints = null;
    let currentEnhancement = null;
    let currentUnitStartIndex = null;
    let headerProcessed = false;

    const flushUnit = () => {
        if (!currentUnit) return;
        // Insert blank line if previous unit is different
        if (prevUnitName !== null && prevUnitName !== currentUnit) {
            cleanedLines.push('');
        }
        const modelCount = showModels ? countModelsInUnit(lines, currentUnitStartIndex) : 0;
        const modelText = formatModelCountPrefix(modelCount);
        const unitLine = showPoints ? `${modelText}${currentUnit} (${currentPoints})` : `${modelText}${currentUnit}`;
        cleanedLines.push(unitLine);
        if (currentEnhancement) {
            cleanedLines.push(`  • Enhancement: ${currentEnhancement}`);
        }
        prevUnitName = currentUnit;
        currentUnit = null;
        currentPoints = null;
        currentEnhancement = null;
        currentUnitStartIndex = null;
    };

    for (let i = startIndex; i < lines.length; i++) {
        const line = normalizeApostrophes(lines[i].trim());
        if (!line) continue;
        if (isKnownSectionHeader(line)) continue;

        if (!headerProcessed) {
            if (isNewRecruit) {
                headerProcessed = true;
            } else if (isPointsLine(line) && !line.includes('Strike Force')) {
                headerProcessed = true;
            } else {
                continue;
            }
        }

        if (isNewRecruit) {
            const parsedUnit = parseNewRecruitUnitLine(line);
            if (parsedUnit) {
                flushUnit();
                const unitName = formatUnitName(parsedUnit.unitName, isTauEmpire, smartFormat, isChaosSpaceMarines);
                currentUnit = unitName;
                currentPoints = parsedUnit.points;
                currentUnitStartIndex = i;
            } else if (line.match(ENHANCEMENT_PATTERN) || isNewRecruitEnhancementLine(line) || line.match(/^Enhancement:\s+([^(]+)\s+\(\+\d+\s*pts\)/)) {
                // Only attach enhancement if a unit is being processed
                if (currentUnit) {
                    currentEnhancement = extractEnhancement(line);
                }
            }
        } else {
            const parsedGWUnit = parseGWUnitLine(line);
            if (parsedGWUnit) {
                flushUnit();
                const unitName = formatUnitName(parsedGWUnit.unitName, isTauEmpire, smartFormat, isChaosSpaceMarines);
                currentUnit = unitName;
                currentPoints = parsedGWUnit.points;
                currentUnitStartIndex = i;
            } else if (line.match(ENHANCEMENT_PATTERN)) {
                if (currentUnit) {
                    currentEnhancement = extractEnhancement(line);
                }
            }
        }
    }
    // Flush the last unit (if any)
    flushUnit();
    // Remove any trailing blank lines
    while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === '') {
        cleanedLines.pop();
    }
    // Remove extra blank lines (never more than one in a row)
    return cleanedLines.filter((line, idx, arr) => {
        if (line.trim() !== '') return true;
        return idx > 0 && arr[idx - 1].trim() !== '';
    });
}

/**
 * Consolidates consecutive duplicate lines by adding a count prefix
 * @param {string} text - The text to process
 * @returns {string} - The text with consecutive duplicates consolidated
 */
function consolidateDuplicateLines(text) {
    if (!text) return text;

    const lines = text.split('\n');
    const consolidatedLines = [];
    let i = 0;

    while (i < lines.length) {
        const currentLine = lines[i];
        let count = 1;
        let j = i + 1;

        // Count consecutive duplicates
        while (j < lines.length && lines[j] === currentLine) {
            count++;
            j++;
        }

        if (count > 1) {
            // Add count prefix to the line
            consolidatedLines.push(`${count} ${currentLine}`);
        } else {
            // No duplicates, keep the line as is
            consolidatedLines.push(currentLine);
        }

        i = j; // Skip the duplicates we just processed
    }

    return consolidatedLines.join('\n');
}

/**
 * Moves enhancement lines into square brackets with their preceding unit line
 * @param {string} text - The text to process
 * @returns {string} - The text with enhancement lines inlined
 */
function inlineEnhancementLines(text) {
    if (!text) return text;

    const lines = text.split('\n');
    const processedLines = [];
    let i = 0;

    while (i < lines.length) {
        const currentLine = lines[i];
        
        // Check if next line is an enhancement line
        if (i + 1 < lines.length) {
            const enhancementMatch = lines[i + 1].match(ENHANCEMENT_LINE_PATTERN);
            if (enhancementMatch) {
                const enhancementName = enhancementMatch[1].trim();
                
                // Add enhancement in square brackets to the current line
                if (currentLine.includes('(')) {
                    // Line has points, insert enhancement before points
                    const beforePoints = getLineBeforePoints(currentLine);
                    const points = getPointsPart(currentLine);
                    processedLines.push(`${beforePoints} [${enhancementName}] ${points}`);
                } else {
                    // Line has no points, just add enhancement at the end
                    processedLines.push(`${currentLine.trim()} [${enhancementName}]`);
                }
                
                i += 2; // Skip the enhancement line
                continue;
            }
        }
        
        // No enhancement, keep line as is
        processedLines.push(currentLine);
        i++;
    }

    return processedLines.join('\n');
}

/**
 * Converts a multi-line roster to a single line with comma separators
 * @param {string} text - The text to convert
 * @returns {string} - The text converted to a single line
 */
function convertToOneLiner(text) {
    if (!text) return text;

    const lines = text.split('\n');
    const nonEmptyLines = lines
        .map(line => line.trim())
        .filter(line => line.length > 0);

    return nonEmptyLines.join(', ');
}

/**
 * Validates input parameters for the cleanRosterText function
 * @param {any} input - The input to validate
 * @param {any} showPoints - The showPoints parameter to validate
 * @param {any} smartFormat - The smartFormat parameter to validate
 * @param {any} showModels - The showModels parameter to validate
 * @param {any} consolidateDuplicates - The consolidateDuplicates parameter to validate
 * @param {any} oneLiner - The oneLiner parameter to validate
 * @param {any} inlineEnhancements - The inlineEnhancements parameter to validate
 * @param {any} showHeader - The showHeader parameter to validate
 * @throws {Error} If any parameter is invalid
 */
function validateCleanRosterInput(input, showPoints, smartFormat, showModels, consolidateDuplicates, oneLiner, inlineEnhancements, showHeader) {
    validateString(input, 'input');
    validateBoolean(showPoints, 'showPoints');
    validateBoolean(smartFormat, 'smartFormat');
    validateBoolean(showModels, 'showModels');
    validateBoolean(consolidateDuplicates, 'consolidateDuplicates');
    validateBoolean(oneLiner, 'oneLiner');
    validateBoolean(inlineEnhancements, 'inlineEnhancements');
    validateBoolean(showHeader, 'showHeader');
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
 * @typedef {object} CleanRosterOptions
 * @property {string} input - The roster text to clean
 * @property {boolean} [showPoints=true] - Whether to include points in the output
 * @property {boolean} [smartFormat=true] - Whether to apply smart formatting to unit names
 * @property {boolean} [showModels=false] - Whether to show model counts
 * @property {boolean} [consolidateDuplicates=false] - Whether to consolidate consecutive duplicate lines
 * @property {boolean} [oneLiner=false] - Whether to convert output to a single line with comma separators
 * @property {boolean} [inlineEnhancements=false] - Whether to move enhancement lines into square brackets with unit names
 * @property {boolean} [showHeader=true] - Whether to show army header information
 * @property {boolean} [noEmptyLines=false] - Whether to remove all empty lines from the output
 */

/**
 * Removes all empty lines from the given text
 * @param {string} text - The text to process
 * @returns {string} - The text with all empty lines removed
 */
function removeEmptyLines(text) {
    return text
        .split('\n')
        .filter(line => line.trim().length > 0)
        .join('\n');
}

/**
 * Cleans and formats a NewRecruit roster text according to specified options
 * @param {CleanRosterOptions} options - The options for cleaning the roster
 * @returns {string} - The cleaned roster text
 */
function cleanNewRecruitRosterText(options) {
    const {
        input,
        showPoints = true,
        smartFormat = true,
        showModels = false,
        showHeader = true
    } = options;
    const lines = input.trim().split('\n');
    const cleanedLines = [];
    const { armyInfo, firstPointsLine, headerEndIndex } = processNewRecruitHeader(lines);
    
    // For NewRecruit rosters, we include faction and detachment info with points appended
    // since they don't have roster names but do have faction/detachment information
    if (showHeader) {
        if (armyInfo.length > 0) {
            let headerLine = armyInfo.join(' - ');
            // Append points to the faction/detachment line if points are enabled
            if (showPoints && firstPointsLine) {
                const pointsMatch = firstPointsLine.match(/\((\d+)\s*points\)/);
                if (pointsMatch) {
                    headerLine += ` (${pointsMatch[1]} Points)`;
                }
            }
            cleanedLines.push(headerLine);
            cleanedLines.push('');
        }
    }
    
    const isTauEmpire = armyInfo.some(line => normalizeFactionName(line).includes('tauempire'));
    const isChaosSpaceMarines = armyInfo.some(line => normalizeFactionName(line).includes('chaosspacemarines'));
    cleanedLines.push(...processUnits({
        lines,
        startIndex: headerEndIndex,
        showPoints,
        smartFormat,
        isTauEmpire,
        isChaosSpaceMarines,
        showModels
    }));
    return normalizeApostrophes(cleanedLines.join('\n'));
}

/**
 * Cleans and formats a GW roster text according to specified options
 * @param {CleanRosterOptions} options - The options for cleaning the roster
 * @returns {string} - The cleaned roster text
 */
function cleanGWRosterText(options) {
    const {
        input,
        showPoints = true,
        smartFormat = true,
        showModels = false,
        showHeader = true
    } = options;
    const lines = input.trim().split('\n');
    const cleanedLines = [];
    const { armyInfo, firstPointsLine, headerEndIndex } = processArmyHeader(lines);
    if (showHeader) {
        if (firstPointsLine) {
            cleanedLines.push(showPoints ? firstPointsLine : firstPointsLine.replace(POINTS_REMOVAL_PATTERN, ''));
        }
        if (armyInfo.length > 0) {
            cleanedLines.push(armyInfo.join(' - '));
            cleanedLines.push('');
        }
    }
    const isTauEmpire = armyInfo.some(line => normalizeFactionName(line).includes('tauempire'));
    const isChaosSpaceMarines = armyInfo.some(line => normalizeFactionName(line).includes('chaosspacemarines'));
    cleanedLines.push(...processUnits({
        lines,
        startIndex: headerEndIndex,
        showPoints,
        smartFormat,
        isTauEmpire,
        isChaosSpaceMarines,
        showModels
    }));
    return normalizeApostrophes(cleanedLines.join('\n'));
}

function isNewRecruitNRFormat(lines) {
    // Detects the NR-NR format by header and section structure
    return (
        lines[0] && lines[0].match(/\[\d+ pts\]/) &&
        lines.some(line => line.match(/^## /))
    );
}

function processNewRecruitNRHeader(lines) {
    // Extracts faction, detachment, and points from the NR-NR header
    let faction = '';
    let detachment = '';
    let points = '';
    // First line: Chaos - Chaos Space Marines - The Goal is to Survive the Shooting Phase - [1990 pts]
    const headerMatch = lines[0].match(/^(.*?)-\s*\[(\d+) pts\]/);
    if (headerMatch) {
        // Faction and detachment are before the last dash
        const beforePoints = headerMatch[1].trim();
        const parts = beforePoints.split(' - ');
        // Try to find detachment from Detachment Choice line
        const detachmentLine = lines.find(line => line.startsWith('Detachment Choice:'));
        if (detachmentLine) {
            detachment = detachmentLine.replace('Detachment Choice:', '').trim();
        } else if (parts.length > 2) {
            detachment = parts[parts.length - 1];
        }
        // Faction is the last 'Chaos Space Marines' part
        faction = parts.find(p => p.includes('Space Marines')) || parts[1] || parts[0];
        points = headerMatch[2];
    }
    return {
        armyInfo: [faction + (detachment ? ' - ' + detachment : '')],
        points,
        headerEndIndex: 1 // Start after the first line
    };
}

function processNewRecruitNRUnits(lines, startIndex, showPoints, smartFormat, isTauEmpire, isChaosSpaceMarines, showModels = false) {
    // Parse units from NR-NR format
    const cleanedLines = [];
    let lastUnit = '';
    let currentUnitStartIndex = startIndex;
    
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#') || line.startsWith('•')) continue;
        // Match unit lines: Unit Name [105 pts]: ... or Unit Name [105 pts]:
        const unitMatch = line.match(/^([\w\s\-]+) \[(\d+) pts\]:\s*(.*)$/);
        if (unitMatch) {
            let unitName = unitMatch[1].trim();
            const points = unitMatch[2];
            const details = unitMatch[3] || '';
            unitName = formatUnitName(unitName, isTauEmpire, smartFormat, isChaosSpaceMarines);
            
            // Calculate model count if needed
            const modelCount = showModels ? countModelsInNewRecruitNRUnit(lines, i) : 0;
            const modelText = formatModelCountPrefix(modelCount);
            const unitLine = showPoints ? `${modelText}${unitName} (${points})` : `${modelText}${unitName}`;
            
            if (lastUnit && lastUnit !== unitName) {
                cleanedLines.push('');
            }
            cleanedLines.push(unitLine);
            // Find enhancement in details
            const enhancement = NR_NR_ENHANCEMENTS.find(e => details.includes(e));
            if (enhancement) {
                cleanedLines.push(`  • Enhancement: ${enhancement}`);
            }
            lastUnit = unitName;
            currentUnitStartIndex = i;
        }
    }
    return cleanedLines;
}

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
        showModels = false,
        consolidateDuplicates = false,
        oneLiner = false,
        inlineEnhancements = false,
        showHeader = true,
        noEmptyLines = false
    } = options;
    validateCleanRosterInput(input, showPoints, smartFormat, showModels, consolidateDuplicates, oneLiner, inlineEnhancements, showHeader);
    const trimmedInput = input.trim();
    if (!trimmedInput) return '';
    const lines = trimmedInput.split('\n');
    let result = '';
    if (isNewRecruitNRFormat(lines)) {
        // Handle NR-NR format
        const { armyInfo, points, headerEndIndex } = processNewRecruitNRHeader(lines);
        const isTauEmpire = armyInfo.some(line => normalizeFactionName(line).includes('tauempire'));
        const isChaosSpaceMarines = armyInfo.some(line => normalizeFactionName(line).includes('chaosspacemarines'));
        
        const cleanedLines = [];
        if (showHeader) {
            let headerLine = armyInfo.join(' - ');
            if (showPoints && points) {
                headerLine += ` (${points} Points)`;
            }
            cleanedLines.push(headerLine);
            cleanedLines.push('');
        }
        cleanedLines.push(...processNewRecruitNRUnits(lines, headerEndIndex, showPoints, smartFormat, isTauEmpire, isChaosSpaceMarines, showModels));
        result = normalizeApostrophes(cleanedLines.join('\n'));
    } else if (isNewRecruitFormat(lines)) {
        result = cleanNewRecruitRosterText({ input, showPoints, smartFormat, showModels, showHeader });
    } else {
        result = cleanGWRosterText({ input, showPoints, smartFormat, showModels, showHeader });
    }
    // Post-processing (shared)
    const effectiveInlineEnhancements = inlineEnhancements || oneLiner;
    if (effectiveInlineEnhancements) {
        result = inlineEnhancementLines(result);
    }
    if (consolidateDuplicates) {
        result = consolidateDuplicateLines(result);
    }
    if (oneLiner) {
        result = convertToOneLiner(result);
    }
    if (noEmptyLines) {
        result = removeEmptyLines(result);
    }
    
    // Normalize all whitespace to regular spaces for consistent output
    result = result.replace(/\u00A0/g, ' '); // Replace non-breaking spaces with regular spaces
    
    return result;
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
    processUnits,
    countModelsInNewRecruitUnit,
    consolidateDuplicateLines,
    convertToOneLiner,
    inlineEnhancementLines,
    removeEmptyLines,
    extractEnhancement,
    parseNewRecruitUnitLine,
    parseGWUnitLine,
    formatModelCountPrefix,
    isNewRecruitEnhancementLine
}; 