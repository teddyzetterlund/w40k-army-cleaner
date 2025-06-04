/**
 * Configuration constants for roster processing
 */
export const ROSTER_CONFIG = {
    /**
     * Known section headers in a roster file
     */
    SECTION_HEADERS: [
        'CHARACTERS',
        'BATTLELINE',
        'DEDICATED TRANSPORTS',
        'OTHER DATASHEETS',
        'ALLIED UNITS'
    ],

    /**
     * Known game formats
     */
    GAME_FORMATS: [
        'Strike Force',
        'Incursion',
        'Onslaught'
    ],

    /**
     * T'au unit base names that need special handling
     */
    TAU_UNIT_BASES: [
        'Broadside',
        'Crisis Fireknife',
        'Crisis Starscythe',
        'Stealth'
    ]
}; 