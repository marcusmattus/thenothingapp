/**
 * Generate a deterministic position for a node based on wallet address
 * @param {string} address - Ethereum wallet address
 * @returns {Object} x and y coordinates for the node
 */
export const getNodePosition = (address) => {
  if (!address) return { x: 0.5, y: 0.5 };
  
  // Use a simple hash algorithm to generate deterministic positions
  const addressBytes = address.split('').map(char => char.charCodeAt(0));
  const xSeed = addressBytes.reduce((sum, byte, i) => sum + byte * (i + 1), 0) % 1000;
  const ySeed = addressBytes.reduce((sum, byte, i) => sum + byte * (i + 2), 0) % 1000;
  
  // Normalize to 0-1 range (with some padding from edges)
  return {
    x: (xSeed / 1000) * 0.6 + 0.2,
    y: (ySeed / 1000) * 0.6 + 0.2
  };
};

/**
 * Generate a color based on wallet address
 * @param {string} address - Ethereum wallet address
 * @returns {string} CSS color string
 */
export const getNodeColor = (address) => {
  if (!address) return '#404052';
  
  // Generate a deterministic hue based on the address
  const addressBytes = address.split('').map(char => char.charCodeAt(0));
  const hue = addressBytes.reduce((sum, byte) => sum + byte, 0) % 360;
  
  // Use a consistent saturation and lightness
  const saturation = 70;
  const lightness = 60;
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Calculate distance between two nodes
 * @param {Array} pos1 - [x, y] coordinates of first node
 * @param {Array} pos2 - [x, y] coordinates of second node
 * @returns {number} Distance between nodes
 */
export const calculateDistance = (pos1, pos2) => {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Create mock nodes for testing
 * @param {number} count - Number of nodes to generate
 * @returns {Array} Array of node objects
 */
export const generateMockNodes = (count = 10) => {
  const nodes = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a mock address
    const mockAddress = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
    
    // Get deterministic position and color
    const position = getNodePosition(mockAddress);
    const color = getNodeColor(mockAddress);
    
    // Add some randomness to the pulse intensity
    const pulseIntensity = 0.8 + Math.random() * 0.4;
    
    nodes.push({
      id: `node-${i}`,
      address: mockAddress,
      x: position.x,
      y: position.y,
      color,
      pulseIntensity,
      size: 8 + Math.random() * 4 // Random size between 8 and 12
    });
  }
  
  return nodes;
};