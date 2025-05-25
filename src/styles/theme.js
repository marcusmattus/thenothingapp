const theme = {
  colors: {
    // Primary colors
    background: '#15151F',         // Dark blue/black
    cardBackground: '#1E1E2A',     // Slightly lighter background for cards
    canvasBackground: '#12121A',   // Darker background for node canvas
    
    // Text colors
    text: '#FFFFFF',               // White text
    textSecondary: '#9B9BAD',      // Light gray for secondary text
    
    // Accent colors
    accent: '#8A2BE2',             // Vibrant purple
    accentDark: '#5D1D9A',         // Darker purple
    
    // Utility colors
    error: '#E25C5C',              // Red for errors
    success: '#4CAF50',            // Green for success
    warning: '#FFC107',            // Yellow for warnings
    
    // UI Elements
    buttonText: '#FFFFFF',         // White text on buttons
    connection: '#404052',         // Color for node connections
    
    // Node colors are generated dynamically based on wallet addresses
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Typography
  typography: {
    fontFamily: {
      regular: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },
};

export default theme;