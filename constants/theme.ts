

import { Platform } from 'react-native';

// Primary colors aligned with BG_IMAGE blue gradient theme
const primaryBlue = '#0080E1';       // Main brand blue
const secondaryTeal = '#00A0D2';     // Accent teal
const lightSkyBlue = '#E8F4FF';      // Light sky background
const darkNavy = '#0A2540';          // Dark navy for text

// Status colors for attendance system
const successGreen = '#10B981';      // Present/Checked In
const warningOrange = '#F59E0B';     // Late/Warning
const dangerRed = '#EF4444';         // Absent/Error
const neutralGray = '#6B7280';       // Neutral/Pending

// Background Image - Used across all auth screens
export const BG_IMAGE = require('../assets/images/bg 2.jpg');

export const Colors = {
  light: {
    text: darkNavy,                    // Dark navy for primary text
    background: lightSkyBlue,          // Light sky blue background
    tint: primaryBlue,                 // Primary brand blue
    icon: secondaryTeal,               // Teal for icons
    tabIconDefault: neutralGray,       // Gray for inactive tabs
    tabIconSelected: primaryBlue,      // Blue for active tabs
    
    // Additional colors for UI components
    cardBackground: '#FFFFFF',         // White cards
    inputBorder: secondaryTeal,        // Teal borders
    buttonBackground: primaryBlue,     // Blue buttons
    buttonText: '#FFFFFF',             // White button text
    
    // Status colors
    success: successGreen,             // Present/Success
    warning: warningOrange,            // Late/Warning
    danger: dangerRed,                 // Absent/Error
    neutral: neutralGray,              // Pending/Neutral
    
    // Additional utilities
    divider: '#D1E7F5',                // Light blue divider
    overlay: 'rgba(10, 37, 64, 0.3)',  // Dark navy overlay
  },
  dark: {
    text: '#E8F4FF',                   // Light sky blue text
    background: darkNavy,              // Dark navy background
    tint: secondaryTeal,               // Teal in dark mode
    icon: '#B0D4E8',                   // Light blue icons
    tabIconDefault: '#5B7A8F',         // Muted blue for inactive tabs
    tabIconSelected: secondaryTeal,    // Teal for active tabs
    
    // Additional colors for UI components
    cardBackground: '#1A3A52',         // Dark blue cards
    inputBorder: '#2A5A7A',            // Darker teal borders
    buttonBackground: secondaryTeal,   // Teal buttons
    buttonText: darkNavy,              // Navy button text
    
    // Status colors
    success: successGreen,             // Present/Success
    warning: warningOrange,            // Late/Warning
    danger: dangerRed,                 // Absent/Error
    neutral: '#8A9FB5',                // Neutral muted blue
    
    // Additional utilities
    divider: '#2A5A7A',                // Dark blue divider
    overlay: 'rgba(232, 244, 255, 0.1)', // Light overlay
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
