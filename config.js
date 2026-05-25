/**
 * Duty Scheduler Configuration
 * Fixed names for person assignment
 * This file can be easily edited to update the available names
 */

const FIXED_NAMES = [
    'Jaime',
    'Nenette',
    'Olan',
    'Annie',
    'Shirley',
    'Ofie',
    'Arnel'
];

// Color palette from QR_GeneratorApp
const THEME_COLORS = {
    light: {
        warm: {
            50: '#faf8f5',
            100: '#f5f1eb',
            200: '#f3e4c9',
            300: '#e8d5b8',
            400: '#bfa28c',
            500: '#a98b76',
            600: '#8b6f5e',
            700: '#6b5546',
            800: '#4b3a2f',
            900: '#2b1f18',
        },
        sage: {
            50: '#fafbf8',
            100: '#f0f2eb',
            200: '#e0e5d9',
            300: '#c7cebd',
            400: '#babf94',
            500: '#a8ad80',
            600: '#8a8f68',
            700: '#6b7050',
            800: '#4d5038',
            900: '#353820',
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FIXED_NAMES, THEME_COLORS };
}
