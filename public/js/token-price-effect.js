/**
 * Token Price Effect for The Nothing App
 * Shows how burning tokens affects the network and token price
 */

// Token price and network state
let tokenState = {
  totalSupply: 10000000, // Initial total supply
  circulatingSupply: 5000000, // Initial circulating supply
  burnedTokens: 0, // Total burned tokens
  price: 0.015, // Initial price in AVAX
  burnEvents: [], // Store burn events for visualization
  priceHistory: [] // Track price changes
};

// Store node sizing based on token activity
let nodeSizing = {};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize price history with current price
  initializePriceData();
  
  // Set up event listeners for token burning
  setupTokenBurnListeners();
  
  // Listen for token buy events
  document.addEventListener('token-bought', function(e) {
    if (e.detail && e.detail.amount) {
      // Update UI based on buy
      updateTokenDisplay(e.detail.amount, 'buy');
    }
  });
  
  // Listen for supply changes from governance
  document.addEventListener('token-supply-changed', function(e) {
    if (e.detail && e.detail.newSupply) {
      // Update token state with new supply
      tokenState.totalSupply = e.detail.newSupply;
      
      // Update UI
      updatePriceDisplay();
    }
  });
  
  // Update network visualization based on token activity
  connectNetworkWithTokenomics();
});

/**
 * Initialize price history data
 */
function initializePriceData() {
  // Create initial price history (last 30 days)
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Create some natural-looking price fluctuation
    const fluctuation = 0.001 * (Math.random() - 0.3); // Slight upward bias
    
    // Add to history
    tokenState.priceHistory.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(0.01, tokenState.price + fluctuation)
    });
    
    // Update current price to last value
    if (i === 0) {
      tokenState.price = tokenState.priceHistory[tokenState.priceHistory.length - 1].price;
    }
  }
  
  // Update UI with current price
  updatePriceDisplay();
}

/**
 * Set up event listeners for token burning
 */
function setupTokenBurnListeners() {
  // Listen for burn form submission
  const burnForm = document.getElementById('burn-form');
  if (burnForm) {
    burnForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get amount from form
      const burnAmount = parseFloat(document.getElementById('burn-amount').value);
      if (isNaN(burnAmount) || burnAmount <= 0) return;
      
      // Process burn and update price
      processBurnAndUpdatePrice(burnAmount);
    });
  }
  
  // Create a custom event for burns that might happen elsewhere
  document.addEventListener('token-burned', function(e) {
    if (e.detail && e.detail.amount) {
      processBurnAndUpdatePrice(e.detail.amount);
    }
  });
}

/**
 * Process token burn and update price
 * @param {number} amount - Amount of tokens to burn
 */
function processBurnAndUpdatePrice(amount) {
  // Update token state
  tokenState.burnedTokens += amount;
  tokenState.circulatingSupply -= amount;
  
  // Calculate price impact based on burn amount
  // Formula: Price increases proportionally to the percentage of circulating supply burned
  const burnPercentage = amount / tokenState.circulatingSupply;
  const priceIncrease = tokenState.price * burnPercentage * 5; // Multiplier for effect visibility
  
  // Update price (with some randomness for realism)
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  tokenState.price += priceIncrease * randomFactor;
  
  // Add burn event to history
  tokenState.burnEvents.push({
    amount: amount,
    timestamp: Date.now(),
    price: tokenState.price,
    address: getCurrentUserAddress()
  });
  
  // Add to price history
  tokenState.priceHistory.push({
    date: new Date().toISOString().split('T')[0],
    price: tokenState.price
  });
  
  // Update UI
  updatePriceDisplay();
  
  // Trigger network visualization update
  updateNetworkVisualization(amount);
  
  console.log(`Burned ${amount} tokens. New price: ${tokenState.price.toFixed(6)} AVAX`);
}

/**
 * Update token display based on buy, sell, or burn operation
 * @param {number} amount - Amount of tokens involved
 * @param {string} operation - 'buy', 'sell', or 'burn'
 */
function updateTokenDisplay(amount, operation) {
  if (operation === 'buy') {
    // For buys, price may slightly increase
    const priceIncrease = tokenState.price * 0.005 * (amount / 10000);
    tokenState.price += priceIncrease;
    
    // Update price history
    tokenState.priceHistory.push({
      date: new Date().toISOString().split('T')[0],
      price: tokenState.price
    });
  }
  else if (operation === 'sell') {
    // For sells, price may slightly decrease
    const priceDecrease = tokenState.price * 0.008 * (amount / 10000);
    tokenState.price = Math.max(0.001, tokenState.price - priceDecrease);
    
    // Update price history
    tokenState.priceHistory.push({
      date: new Date().toISOString().split('T')[0],
      price: tokenState.price
    });
  }
  
  // Update UI
  updatePriceDisplay();
}

/**
 * Update the price display in the UI
 */
function updatePriceDisplay() {
  // Update token price display
  const priceDisplay = document.getElementById('token-price');
  if (priceDisplay) {
    priceDisplay.textContent = `${tokenState.price.toFixed(6)} AVAX`;
  }
  
  // Update burned tokens display
  const burnedDisplay = document.getElementById('tokens-burned');
  if (burnedDisplay) {
    burnedDisplay.textContent = tokenState.burnedTokens.toFixed(2);
  }
  
  // Update circulating supply
  const circulatingSupplyEl = document.getElementById('circulating-supply');
  if (circulatingSupplyEl) {
    circulatingSupplyEl.textContent = tokenState.circulatingSupply.toLocaleString();
  }
  
  // Update burned supply
  const burnedSupplyEl = document.getElementById('burned-supply');
  if (burnedSupplyEl) {
    burnedSupplyEl.textContent = tokenState.burnedTokens.toLocaleString();
  }
  
  // Sync with liquidity pool
  if (window.liquidityPool) {
    window.liquidityPool.circulatingSupply = tokenState.circulatingSupply;
    window.liquidityPool.burnedSupply = tokenState.burnedTokens;
  }
  
  // Highlight price if it changed recently
  if (priceDisplay) {
    priceDisplay.classList.add('price-changed');
    setTimeout(() => {
      priceDisplay.classList.remove('price-changed');
    }, 2000);
  }
}

/**
 * Update network visualization based on burn activity
 * @param {number} burnAmount - Amount of tokens burned
 */
function updateNetworkVisualization(burnAmount) {
  // Get current user address
  const userAddress = getCurrentUserAddress();
  if (!userAddress) return;
  
  // Update node size based on burn activity
  if (!nodeSizing[userAddress]) {
    nodeSizing[userAddress] = {
      totalBurned: 0,
      sizeMultiplier: 1
    };
  }
  
  // Update burn totals
  nodeSizing[userAddress].totalBurned += burnAmount;
  
  // Calculate size multiplier based on burn amount
  // More burns = slightly larger node
  nodeSizing[userAddress].sizeMultiplier = 1 + Math.min(0.5, nodeSizing[userAddress].totalBurned / 1000);
  
  // Get all canvas nodes
  const canvas = document.querySelector('#network-canvas-container canvas');
  if (!canvas) return;
  
  // Create a ripple effect from the user's node
  createRippleEffect(userAddress);
  
  // Dispatch event for node size update
  window.dispatchEvent(new CustomEvent('node-activity-update', { 
    detail: { 
      nodeSizing: nodeSizing,
      burnAmount: burnAmount,
      userAddress: userAddress
    } 
  }));
}

/**
 * Create a visual ripple effect from the user's node
 * @param {string} userAddress - User's wallet address
 */
function createRippleEffect(userAddress) {
  // Find the user's node element in the visualization
  const networkCanvas = document.querySelector('#network-canvas-container');
  if (!networkCanvas) return;
  
  // Create ripple element
  const ripple = document.createElement('div');
  ripple.className = 'token-burn-ripple';
  networkCanvas.appendChild(ripple);
  
  // Position the ripple at the center of the canvas (approximation)
  ripple.style.left = '50%';
  ripple.style.top = '50%';
  
  // Animate and remove
  setTimeout(() => {
    ripple.remove();
  }, 2000);
}

/**
 * Get current user's wallet address
 * @returns {string} User's wallet address
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
 * Connect network visualization with tokenomics
 */
function connectNetworkWithTokenomics() {
  // Listen for node size update events
  window.addEventListener('node-activity-update', function(e) {
    if (e.detail && e.detail.nodeSizing) {
      // Update nodes based on burn activity
      const canvas = document.querySelector('#network-canvas-container canvas');
      if (!canvas) return;
      
      // Add a ripple effect on the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw a fading circle
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
      
      // Animate the ripple
      let radius = 0;
      let opacity = 0.3;
      
      const rippleInterval = setInterval(() => {
        // Clear the previous circle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw new circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(170, 170, 170, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Increase radius and decrease opacity
        radius += 5;
        opacity -= 0.01;
        
        // Stop when the circle is too big or too transparent
        if (radius > maxRadius || opacity <= 0) {
          clearInterval(rippleInterval);
        }
      }, 30);
    }
  });
}

// Export token state for other modules
window.tokenPriceEffect = {
  getTokenState: function() {
    return tokenState;
  },
  getNodeSizing: function() {
    return nodeSizing;
  }
};