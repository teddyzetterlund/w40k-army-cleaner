import { normalizeApostrophes, normalizeFactionName } from './utils/string-utils.js';
import { SECTION_HEADERS, GAME_FORMATS, TAU_UNIT_BASES } from './config/roster-constants.js';

/**
 * Checks if a line is a known section header
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line is a section header
 */
const isKnownSectionHeader = (line) => SECTION_HEADERS.includes(line);

/**
 * Checks if a line contains points information
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line contains points information
 */
const isPointsLine = (line) => line.match(/\((\d+)\s*points?\)/i);

/**
 * Checks if a line contains game format information
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line contains game format information
 */
const isGameFormatLine = (line) => GAME_FORMATS.some(format => line.includes(format));

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

// Header processing functions
function processArmyHeader(lines) {
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

// Unit processing functions
function formatUnitName(unitName, isTauEmpire, smartFormat) {
    if (!smartFormat) return unitName;

    let formattedName = unitName;

    // Space Marines specific formatting
    if (formattedName.endsWith(' Squad')) {
        const baseName = formattedName.slice(0, -6);
        formattedName = baseName.endsWith('s') ? baseName : baseName + 's';
    }

    // T'au Empire specific formatting
    if (isTauEmpire) {
        formattedName = formatTauUnitName(formattedName);
    }

    return formattedName;
}

function formatTauUnitName(unitName) {
    let formatted = unitName
        .replace(/Battlesuit/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    let battlesuitsMatch = formatted.match(/(.+) Battlesuits?$/);
    if (battlesuitsMatch) {
        let base = battlesuitsMatch[1].trim();
        formatted = base.endsWith('s') ? base : base + 's';
    }

    formatted = formatted
        .replace(/^Commander in /, '')
        .replace(/^Commander /, '')
        .trim();

    const tauBases = ['Broadside', 'Crisis Fireknife', 'Crisis Starscythe', 'Stealth'];
    for (const base of tauBases) {
        if (formatted === base) {
            formatted = base + 's';
        }
    }

    return formatted.replace(/\s+s$/, 's');
}

function processUnits(lines, startIndex, showPoints, smartFormat, isTauEmpire) {
    const cleanedLines = [];
    let currentUnit = '';
    let currentPoints = '';
    let lastUnit = '';
    let currentUnitAdded = false;
    let headerProcessed = false;

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

        const pointsMatch = line.match(/\((\d+)\s*points?\)/i);
        if (pointsMatch) {
            if (currentUnit && !currentUnitAdded) {
                if (lastUnit && lastUnit !== currentUnit) {
                    cleanedLines.push('');
                }
                cleanedLines.push(showPoints ? `${currentUnit} (${currentPoints})` : currentUnit);
                lastUnit = currentUnit;
            }

            let unitName = line.split('(')[0].trim();
            currentUnit = formatUnitName(unitName, isTauEmpire, smartFormat);
            currentPoints = pointsMatch[1];
            currentUnitAdded = false;
        } else if (line.match(/Enhancements?:/i)) {
            const enhancement = line.split(/Enhancements?:/i)[1].trim();
            if (currentUnit && !currentUnitAdded) {
                if (lastUnit && lastUnit !== currentUnit) {
                    cleanedLines.push('');
                }
                cleanedLines.push(showPoints ? `${currentUnit} (${currentPoints})` : currentUnit);
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
        cleanedLines.push(showPoints ? `${currentUnit} (${currentPoints})` : currentUnit);
    }

    return cleanedLines;
}

function cleanRosterText(input, showPoints = true, smartFormat = true) {
    input = input.trim();
    if (!input) return '';

    const lines = input.split('\n');
    const cleanedLines = [];

    // Process header
    const { armyInfo, firstPointsLine, headerEndIndex } = processArmyHeader(lines);
    
    if (firstPointsLine) {
        cleanedLines.push(showPoints ? firstPointsLine : firstPointsLine.replace(/\(\d+\s*Points?\)/i, ''));
    }

    if (armyInfo.length > 0) {
        cleanedLines.push(armyInfo.join(' - '));
        cleanedLines.push('');
    }

    const isTauEmpire = armyInfo.some(line => 
        normalizeFactionName(line).includes('tauempire')
    );

    // Process units
    const unitLines = processUnits(lines, headerEndIndex, showPoints, smartFormat, isTauEmpire);
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