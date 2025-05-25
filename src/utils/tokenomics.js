/**
 * Calculate token price based on the bonding curve formula
 * Price increases by a fixed percentage with each new user
 * @param {number} userCount - Total number of users in the system
 * @returns {number} Token price in AVAX
 */
export const calculateTokenPrice = (userCount) => {
  // Base price is 0.01 AVAX
  const basePrice = 0.01;
  
  // Each new user increases price by 2%
  // Price = basePrice * (1.02)^userCount
  return basePrice * Math.pow(1.02, userCount);
};

/**
 * Calculate the impact on token price when tokens are burnt
 * @param {number} currentPrice - Current token price
 * @param {number} burnAmount - Amount of tokens being burnt
 * @param {number} totalSupply - Total supply of tokens
 * @returns {number} New token price after burn
 */
export const calculateBurnImpact = (currentPrice, burnAmount, totalSupply) => {
  // Burning has a smaller impact on price (1% decrease per 10% of supply)
  const burnPercentage = (burnAmount / totalSupply) * 100;
  const priceDecreasePercentage = burnPercentage * 0.1;
  
  // Don't let the price decrease by more than 5% in a single burn
  const effectiveDecreasePercentage = Math.min(priceDecreasePercentage, 5);
  
  return currentPrice * (1 - (effectiveDecreasePercentage / 100));
};

/**
 * Calculate the impact on token price when tokens are sold
 * @param {number} currentPrice - Current token price
 * @param {number} sellAmount - Amount of tokens being sold
 * @param {number} totalSupply - Total supply of tokens
 * @returns {number} New token price after sell
 */
export const calculateSellImpact = (currentPrice, sellAmount, totalSupply) => {
  // Selling has a larger impact on price (3% decrease per 10% of supply)
  const sellPercentage = (sellAmount / totalSupply) * 100;
  const priceDecreasePercentage = sellPercentage * 0.3;
  
  // Don't let the price decrease by more than 10% in a single sell
  const effectiveDecreasePercentage = Math.min(priceDecreasePercentage, 10);
  
  return currentPrice * (1 - (effectiveDecreasePercentage / 100));
};

/**
 * Calculate the amount of AVAX received when selling tokens
 * @param {number} tokenAmount - Amount of tokens to sell
 * @param {number} tokenPrice - Current token price in AVAX
 * @returns {number} Amount of AVAX to receive
 */
export const calculateSellReturn = (tokenAmount, tokenPrice) => {
  // Simplified formula: tokens * price
  // In a real implementation, you'd want to account for slippage
  return tokenAmount * tokenPrice;
};