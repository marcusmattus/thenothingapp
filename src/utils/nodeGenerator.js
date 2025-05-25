import { Dimensions } from 'react-native';
import { ethers } from 'ethers';

const { width, height } = Dimensions.get('window');

/**
 * Generate deterministic position for a node based on wallet address
 * @param {string} walletAddress - User's wallet address
 * @returns {Object} x and y coordinates for the node
 */
export const getNodePosition = (walletAddress) => {
  if (!walletAddress) {
    return { x: width / 2, y: height / 2 };
  }

  try {
    // Use keccak256 hash of the address to generate deterministic coordinates
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(walletAddress.toLowerCase()));
    
    // Extract values from different parts of the hash for x and y
    const hashNum = ethers.BigNumber.from(hash);
    const xVal = hashNum.mod(10000).toNumber();
    const yVal = hashNum.div(10000).mod(10000).toNumber();
    
    // Map to screen dimensions, but add some padding on edges
    const padding = 100;
    const x = (xVal / 10000) * (width * 2 - padding * 2) + padding;
    const y = (yVal / 10000) * (height * 2 - padding * 2) + padding;
    
    return { x, y };
  } catch (error) {
    console.error('Error generating node position:', error);
    // Fallback to center position
    return { x: width / 2, y: height / 2 };
  }
};

/**
 * Generate node color based on wallet address
 * Can be used to add visual diversity to nodes
 * @param {string} walletAddress - User's wallet address
 * @returns {string} HEX color
 */
export const getNodeColor = (walletAddress) => {
  if (!walletAddress) {
    return '#FFFFFF';
  }

  try {
    // Generate color from wallet address
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(walletAddress.toLowerCase()));
    const r = parseInt(hash.substring(2, 4), 16);
    const g = parseInt(hash.substring(4, 6), 16);
    const b = parseInt(hash.substring(6, 8), 16);
    
    return `rgb(${r}, ${g}, ${b})`;
  } catch (error) {
    console.error('Error generating node color:', error);
    return '#FFFFFF';
  }
};
