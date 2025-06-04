/**
 * Regular expression patterns used throughout the application
 */

// Points pattern: matches "(X points)" or "(X point)" where X is a number
export const POINTS_PATTERN = /\((\d+)\s*points?\)/i;

// Enhancement pattern: matches "Enhancement:" or "Enhancements:" followed by text
export const ENHANCEMENT_PATTERN = /Enhancements?:/i;

// Points removal pattern: matches "(X Points)" or "(X Point)" for removal
export const POINTS_REMOVAL_PATTERN = /\(\d+\s*Points?\)/i;

// Battlesuit pattern: matches "X Battlesuit" or "X Battlesuits" at the end of a string
export const BATTLESUIT_PATTERN = /(.+) Battlesuits?$/;

// Commander pattern: matches "Commander in " or "Commander " at the start of a string
export const COMMANDER_PATTERN = /^Commander (?:in )?/;

// Multiple 's' pattern: matches one or more 's' at the end of a string
export const MULTIPLE_S_PATTERN = /\s+s$/; 