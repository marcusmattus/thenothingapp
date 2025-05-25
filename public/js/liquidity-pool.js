/**
 * Liquidity Pool for The Nothing App
 * Allows users to add liquidity and buy NTH tokens
 */

// Liquidity pool state
let liquidityPool = {
  avaxLiquidity: 5000, // Initial AVAX in pool
  nthLiquidity: 1000000, // Initial NTH in pool
  userLiquidityProvided: {}, // Track liquidity provided by users
  lpTokens: {}, // LP tokens issued to users
  swapFee: 0.003, // 0.3% swap fee
  liquidityProviders: [],
  priceImpactFactor: 0.02, // Price impact factor for large swaps
  totalSupply: 10000000000 // Default max supply - can be changed
};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize liquidity pool UI
  initLiquidityPoolUI();
  
  // Set up event listeners
  setupLiquidityEventListeners();
  
  // Sync with token price effect module if available
  syncWithTokenPrice();
});

/**
 * Initialize liquidity pool UI
 */
function initLiquidityPoolUI() {
  // Add default circulating and burned supply if not set
  if (!liquidityPool.circulatingSupply) {
    liquidityPool.circulatingSupply = 1000000000; // 10% of max supply circulating initially
  }
  
  if (!liquidityPool.burnedSupply) {
    liquidityPool.burnedSupply = 0;
  }
  
  // Update UI with current liquidity
  updateLiquidityDisplay();
  
  // Initialize max supply input if exists
  const maxSupplyInput = document.getElementById('max-supply-input');
  if (maxSupplyInput) {
    maxSupplyInput.value = liquidityPool.totalSupply.toLocaleString();
  }
  
  // Initialize circulating supply display
  const circulatingSupplyEl = document.getElementById('circulating-supply');
  if (circulatingSupplyEl) {
    circulatingSupplyEl.textContent = liquidityPool.circulatingSupply.toLocaleString();
  }
  
  // Initialize burned supply display
  const burnedSupplyEl = document.getElementById('burned-supply');
  if (burnedSupplyEl) {
    burnedSupplyEl.textContent = liquidityPool.burnedSupply.toLocaleString();
  }
  
  // Sync with token price effect if available
  if (window.tokenPriceEffect && window.tokenPriceEffect.getTokenState) {
    const tokenState = window.tokenPriceEffect.getTokenState();
    tokenState.totalSupply = liquidityPool.totalSupply;
    tokenState.circulatingSupply = liquidityPool.circulatingSupply;
    tokenState.burnedTokens = liquidityPool.burnedSupply;
  }
}

/**
 * Set up event listeners for liquidity features
 */
function setupLiquidityEventListeners() {
  // Add liquidity form
  const addLiquidityForm = document.getElementById('add-liquidity-form');
  if (addLiquidityForm) {
    addLiquidityForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleAddLiquidity();
    });
  }
  
  // Buy tokens form
  const buyTokensForm = document.getElementById('buy-tokens-form');
  if (buyTokensForm) {
    buyTokensForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleBuyTokens();
    });
  }
  
  // Change max supply form
  const changeSupplyForm = document.getElementById('change-supply-form');
  if (changeSupplyForm) {
    changeSupplyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleChangeSupply();
    });
  }
  
  // Input change events for real-time calculations
  const avaxAmountInput = document.getElementById('avax-amount');
  if (avaxAmountInput) {
    avaxAmountInput.addEventListener('input', function() {
      updateNthEstimate();
    });
  }
  
  const buyAvaxInput = document.getElementById('buy-avax-amount');
  if (buyAvaxInput) {
    buyAvaxInput.addEventListener('input', function() {
      updateBuyEstimate();
    });
  }
}

/**
 * Handle adding liquidity to the pool
 */
function handleAddLiquidity() {
  // Get input values
  const avaxAmount = parseFloat(document.getElementById('avax-amount').value);
  if (isNaN(avaxAmount) || avaxAmount <= 0) {
    showLiquidityMessage('Please enter a valid AVAX amount', true);
    return;
  }
  
  // Get user address
  const userAddress = getCurrentUserAddress();
  if (!userAddress) {
    showLiquidityMessage('Please connect your wallet first', true);
    return;
  }
  
  // Calculate how much NTH to add based on current ratio
  const nthAmount = calculateNthForAvax(avaxAmount);
  
  // Check if user has enough NTH
  const userBalance = getUserNthBalance();
  if (userBalance < nthAmount) {
    showLiquidityMessage(`Insufficient NTH balance. You need ${nthAmount.toFixed(2)} NTH`, true);
    return;
  }
  
  // Add liquidity to the pool
  liquidityPool.avaxLiquidity += avaxAmount;
  liquidityPool.nthLiquidity += nthAmount;
  
  // Track user's contribution
  if (!liquidityPool.userLiquidityProvided[userAddress]) {
    liquidityPool.userLiquidityProvided[userAddress] = {
      avax: 0,
      nth: 0
    };
    liquidityPool.liquidityProviders.push(userAddress);
  }
  liquidityPool.userLiquidityProvided[userAddress].avax += avaxAmount;
  liquidityPool.userLiquidityProvided[userAddress].nth += nthAmount;
  
  // Issue LP tokens (simplified)
  const lpTokensIssued = Math.sqrt(avaxAmount * nthAmount);
  if (!liquidityPool.lpTokens[userAddress]) {
    liquidityPool.lpTokens[userAddress] = 0;
  }
  liquidityPool.lpTokens[userAddress] += lpTokensIssued;
  
  // Update UI
  updateLiquidityDisplay();
  
  // Show success message
  showLiquidityMessage(`Successfully added ${avaxAmount} AVAX and ${nthAmount.toFixed(2)} NTH to the liquidity pool`, false);
  
  // Reset form
  document.getElementById('avax-amount').value = '';
  document.getElementById('nth-estimate').textContent = '0';
  
  // Update user's NTH balance
  updateUserBalance(userBalance - nthAmount);
  
  console.log(`Added liquidity: ${avaxAmount} AVAX and ${nthAmount} NTH`);
}

/**
 * Handle buying NTH tokens
 */
function handleBuyTokens() {
  // Get input values
  const avaxAmount = parseFloat(document.getElementById('buy-avax-amount').value);
  if (isNaN(avaxAmount) || avaxAmount <= 0) {
    showLiquidityMessage('Please enter a valid AVAX amount', true);
    return;
  }
  
  // Get user address
  const userAddress = getCurrentUserAddress();
  if (!userAddress) {
    showLiquidityMessage('Please connect your wallet first', true);
    return;
  }
  
  // Calculate NTH amount to receive
  const nthToReceive = calculateBuyAmount(avaxAmount);
  
  // Check if pool has enough liquidity
  if (nthToReceive > liquidityPool.nthLiquidity * 0.5) {
    showLiquidityMessage('Swap too large for current liquidity', true);
    return;
  }
  
  // Execute the swap
  liquidityPool.avaxLiquidity += avaxAmount;
  liquidityPool.nthLiquidity -= nthToReceive;
  
  // Update user's NTH balance
  const userBalance = getUserNthBalance();
  updateUserBalance(userBalance + nthToReceive);
  
  // Update UI
  updateLiquidityDisplay();
  
  // Show success message
  showLiquidityMessage(`Successfully bought ${nthToReceive.toFixed(2)} NTH for ${avaxAmount} AVAX`, false);
  
  // Reset form
  document.getElementById('buy-avax-amount').value = '';
  document.getElementById('buy-estimate').textContent = '0';
  
  // Trigger token price update
  if (window.tokenPriceEffect) {
    // Create a price update event
    const priceEvent = new CustomEvent('token-price-update', {
      detail: {
        newPrice: calculateCurrentPrice(),
        volume: avaxAmount
      }
    });
    document.dispatchEvent(priceEvent);
  }
  
  // Update circulating supply - increase when tokens are bought
  if (typeof updateCirculatingSupply === 'function') {
    updateCirculatingSupply(nthToReceive, 'buy');
  } else if (liquidityPool.circulatingSupply !== undefined) {
    liquidityPool.circulatingSupply += nthToReceive;
    // Update UI
    const circulatingSupplyEl = document.getElementById('circulating-supply');
    if (circulatingSupplyEl) {
      circulatingSupplyEl.textContent = liquidityPool.circulatingSupply.toLocaleString();
    }
  }
  
  console.log(`Bought ${nthToReceive.toFixed(2)} NTH for ${avaxAmount} AVAX`);
}

/**
 * Set total supply (only called by governance system)
 * @param {number} newSupply - New maximum supply
 * @returns {boolean} - Whether update was successful
 */
function setTotalSupply(newSupply) {
  if (isNaN(newSupply) || newSupply < 10000000000) {
    console.error('Supply must be at least 10,000,000,000');
    return false;
  }
  
  // Update the max supply
  liquidityPool.totalSupply = newSupply;
  
  // Update UI - update all supply displays
  const supplyElements = document.querySelectorAll('.supply-stat-value');
  supplyElements.forEach(el => {
    if (el.id === 'current-supply') {
      el.textContent = newSupply.toLocaleString();
    }
  });
  
  // If there's a token contract, update it as well
  if (window.nothingToken && typeof window.nothingToken.updateMaxSupply === 'function') {
    try {
      window.nothingToken.updateMaxSupply(newSupply);
    } catch (error) {
      console.error('Error updating max supply in token contract:', error);
    }
  }
  
  // Emit a custom event for other components to react
  const event = new CustomEvent('token-supply-changed', { 
    detail: { 
      newSupply: newSupply,
      previousSupply: liquidityPool.previousSupply || 10000000000
    } 
  });
  document.dispatchEvent(event);
  
  // Store previous supply for reference
  liquidityPool.previousSupply = newSupply;
  
  // Log the change
  console.log(`Governance system changed max supply to ${newSupply}`);
  return true;
}

/**
 * Get the current total supply
 * @returns {number} - Current total supply
 */
function getTotalSupply() {
  return liquidityPool.totalSupply || 10000000000;
}

/**
 * Calculate how much NTH to add for a given AVAX amount
 * based on the current pool ratio
 * @param {number} avaxAmount - Amount of AVAX
 * @returns {number} - Amount of NTH
 */
function calculateNthForAvax(avaxAmount) {
  const ratio = liquidityPool.nthLiquidity / liquidityPool.avaxLiquidity;
  return avaxAmount * ratio;
}

/**
 * Calculate how much NTH will be received for a given AVAX amount
 * Using the constant product formula: x * y = k
 * @param {number} avaxAmount - Amount of AVAX
 * @returns {number} - Amount of NTH to receive
 */
function calculateBuyAmount(avaxAmount) {
  const k = liquidityPool.avaxLiquidity * liquidityPool.nthLiquidity;
  const newAvaxLiquidity = liquidityPool.avaxLiquidity + avaxAmount;
  const newNthLiquidity = k / newAvaxLiquidity;
  let nthToReceive = liquidityPool.nthLiquidity - newNthLiquidity;
  
  // Apply swap fee
  nthToReceive = nthToReceive * (1 - liquidityPool.swapFee);
  
  // Apply price impact for large swaps
  const percentOfPool = avaxAmount / liquidityPool.avaxLiquidity;
  if (percentOfPool > 0.01) { // If swap is more than 1% of pool
    const priceImpact = percentOfPool * liquidityPool.priceImpactFactor;
    nthToReceive = nthToReceive * (1 - priceImpact);
  }
  
  return nthToReceive;
}

/**
 * Calculate current price of NTH in AVAX
 * @returns {number} - Current price
 */
function calculateCurrentPrice() {
  return liquidityPool.avaxLiquidity / liquidityPool.nthLiquidity;
}

/**
 * Update the estimate of NTH needed for adding liquidity
 */
function updateNthEstimate() {
  const avaxAmount = parseFloat(document.getElementById('avax-amount').value);
  const nthEstimateEl = document.getElementById('nth-estimate');
  
  if (!isNaN(avaxAmount) && avaxAmount > 0) {
    const nthAmount = calculateNthForAvax(avaxAmount);
    nthEstimateEl.textContent = nthAmount.toFixed(2);
  } else {
    nthEstimateEl.textContent = '0';
  }
}

/**
 * Update the estimate of NTH to receive when buying
 */
function updateBuyEstimate() {
  const avaxAmount = parseFloat(document.getElementById('buy-avax-amount').value);
  const buyEstimateEl = document.getElementById('buy-estimate');
  
  if (!isNaN(avaxAmount) && avaxAmount > 0) {
    const nthAmount = calculateBuyAmount(avaxAmount);
    buyEstimateEl.textContent = nthAmount.toFixed(2);
  } else {
    buyEstimateEl.textContent = '0';
  }
}

/**
 * Update the liquidity display in the UI
 */
function updateLiquidityDisplay() {
  // Update pool stats
  const avaxPoolEl = document.getElementById('avax-pool');
  const nthPoolEl = document.getElementById('nth-pool');
  const lpProvidersEl = document.getElementById('lp-providers');
  const currentPriceEl = document.getElementById('current-price');
  const currentSupplyEl = document.getElementById('current-supply');
  
  if (avaxPoolEl) avaxPoolEl.textContent = liquidityPool.avaxLiquidity.toFixed(2);
  if (nthPoolEl) nthPoolEl.textContent = liquidityPool.nthLiquidity.toLocaleString();
  if (lpProvidersEl) lpProvidersEl.textContent = liquidityPool.liquidityProviders.length;
  if (currentPriceEl) currentPriceEl.textContent = calculateCurrentPrice().toFixed(6);
  if (currentSupplyEl) currentSupplyEl.textContent = liquidityPool.totalSupply.toLocaleString();
  
  // If user is connected, update their LP info
  const userAddress = getCurrentUserAddress();
  if (userAddress) {
    const userLpTokensEl = document.getElementById('user-lp-tokens');
    if (userLpTokensEl) {
      const lpTokens = liquidityPool.lpTokens[userAddress] || 0;
      userLpTokensEl.textContent = lpTokens.toFixed(2);
    }
  }
}

/**
 * Show a message in the liquidity section
 * @param {string} message - Message to show
 * @param {boolean} isError - Whether it's an error message
 */
function showLiquidityMessage(message, isError) {
  const messageEl = document.getElementById('liquidity-message');
  const errorEl = document.getElementById('liquidity-error');
  
  if (isError && errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(() => {
      errorEl.classList.add('hidden');
    }, 5000);
  } else if (messageEl) {
    messageEl.textContent = message;
    messageEl.classList.remove('hidden');
    setTimeout(() => {
      messageEl.classList.add('hidden');
    }, 5000);
  } else {
    // Fallback to alert
    if (isError) {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  }
}

/**
 * Get current user's NTH balance
 * @returns {number} - User's NTH balance
 */
function getUserNthBalance() {
  // Try to get from tokenomics engine or balance display
  const balanceEl = document.getElementById('token-balance');
  if (balanceEl) {
    const balanceText = balanceEl.textContent;
    const match = balanceText.match(/(\d+(\.\d+)?)/);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  // Default
  return 100;
}

/**
 * Update user's NTH balance display
 * @param {number} newBalance - New balance
 */
function updateUserBalance(newBalance) {
  const balanceEl = document.getElementById('token-balance');
  if (balanceEl) {
    balanceEl.textContent = `${newBalance.toFixed(2)} $NTH`;
  }
}

/**
 * Get current user's wallet address
 * @returns {string} - User's wallet address
 */
function getCurrentUserAddress() {
  // Try to get from avalanche connector
  if (window.avalancheConnector && window.avalancheConnector.connectedWallet) {
    return window.avalancheConnector.connectedWallet;
  }
  
  // Fallback to a sample address for testing
  return '0x9b710EAa56B1a7D45f12C9c642D8CeE766405489';
}

/**
 * Sync with token price effect module if available
 */
function syncWithTokenPrice() {
  if (window.tokenPriceEffect) {
    // Listen for burn events to update liquidity
    document.addEventListener('token-burned', function(e) {
      if (e.detail && e.detail.amount) {
        // When tokens are burned, they're effectively removed from circulation
        liquidityPool.nthLiquidity -= e.detail.amount;
        updateLiquidityDisplay();
      }
    });
  }
}

// Export liquidity pool for other modules
window.liquidityPool = {
  getPoolInfo: function() {
    return {
      avaxLiquidity: liquidityPool.avaxLiquidity,
      nthLiquidity: liquidityPool.nthLiquidity,
      currentPrice: calculateCurrentPrice(),
      totalSupply: liquidityPool.totalSupply
    };
  },
  getTotalSupply: function() {
    return liquidityPool.totalSupply;
  },
  setTotalSupply: function(newSupply) {
    if (newSupply >= 10000000000) {
      liquidityPool.totalSupply = newSupply;
      return true;
    }
    return false;
  }
};