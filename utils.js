// Utility functions for roster processing

export const normalizeApostrophes = (text) => text.replace(/[''`]/g, "'");

export const isSectionHeader = (line) => 
    ['CHARACTERS', 'BATTLELINE', 'OTHER DATASHEETS'].includes(line);

export const isPointsLine = (line) => line.match(/\((\d+)\s*Points?\)/);

export const isGameFormatLine = (line) => 
    line.includes('Strike Force') || 
    line.includes('Incursion') || 
    line.includes('Onslaught');

export const isArmyInfoLine = (line) => 
    line && 
    !isPointsLine(line) && 
    !line.includes('•') && 
    !line.includes('◦') && 
    !line.includes('x') && 
    !line.match(/\d/) &&
    !line.includes('Exported with'); 