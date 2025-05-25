/**
 * Tokenomics Engine for The Nothing App
 * Coordinates token interactions between blockchain and UI
 */

// Tokenomics state
const tokenomics = {
  isInitialized: false,
  readOnly: false,
  connectedAccount: null,
  tokenContract: null,
  networkType: 'mainnet', // 'mainnet', 'fuji', or 'custom'
  totalSupply: 10000000000,
  circulatingSupply: 1000000000,
  burnedSupply: 0,
  price: 0.01 // AVAX per NTH
};

// Initialize tokenomics engine
document.addEventListener('DOMContentLoaded', function() {
  initTokenomics();
});

/**
 * Initialize tokenomics engine
 */
async function initTokenomics() {
  console.log('TokenomicsEngine: Initializing...');
  
  try {
    // Initialize Web3 connection
    if (window.ethereum) {
      console.log('TokenomicsEngine: Using Web3 with window.ethereum');
      tokenomics.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      console.log('TokenomicsEngine: Using Web3 with window.web3');
      tokenomics.web3 = new Web3(window.web3.currentProvider);
    } else {
      // Create fallback for read-only
      console.log('TokenomicsEngine: Using fallback Web3 provider (read-only)');
      tokenomics.web3 = new Web3('https://api.avax.network/ext/bc/C/rpc');
      tokenomics.readOnly = true;
    }
    
    // Make web3 globally available
    window.web3 = tokenomics.web3;
    
    // Initialize token contract
    tokenomics.tokenContract = new NothingToken();
    await tokenomics.tokenContract.init(tokenomics.web3);
    
    // Update UI for connection status
    updateConnectionUI();
    
    // Set up event listeners
    setupTokenEvents();
    
    // Try to connect wallet if available
    if (!tokenomics.readOnly) {
      try {
        await connectWallet();
      } catch (error) {
        console.warn('Could not auto-connect wallet:', error);
      }
    }
    
    tokenomics.isInitialized = true;
    console.log('TokenomicsEngine: Initialization complete');
    
    // Dispatch event for other components
    document.dispatchEvent(new Event('tokenomics-ready'));
    
  } catch (error) {
    console.error('TokenomicsEngine: Initialization failed:', error);
    tokenomics.readOnly = true;
    updateConnectionUI();
  }
}

/**
 * Set up event listeners for token operations
 */
function setupTokenEvents() {
  // Listen for burn events
  document.addEventListener('token-burned', function(e) {
    if (e.detail && e.detail.amount) {
      updateTokenMetrics({
        burnedSupply: tokenomics.burnedSupply + e.detail.amount,
        circulatingSupply: tokenomics.circulatingSupply - e.detail.amount
      });
    }
  });
  
  // Listen for buy events
  document.addEventListener('token-bought', function(e) {
    if (e.detail && e.detail.amount) {
      updateTokenMetrics({
        circulatingSupply: tokenomics.circulatingSupply + e.detail.amount
      });
    }
  });
  
  // Listen for sell events
  document.addEventListener('token-sold', function(e) {
    if (e.detail && e.detail.amount) {
      updateTokenMetrics({
        circulatingSupply: tokenomics.circulatingSupply - e.detail.amount
      });
    }
  });
  
  // Listen for supply change events from governance
  document.addEventListener('supply-changed', function(e) {
    if (e.detail && e.detail.newSupply) {
      updateTokenMetrics({
        totalSupply: e.detail.newSupply
      });
    }
  });
}

/**
 * Update token metrics and propagate changes
 */
function updateTokenMetrics(changes) {
  // Update local state
  if (changes.totalSupply !== undefined) {
    tokenomics.totalSupply = changes.totalSupply;
  }
  if (changes.circulatingSupply !== undefined) {
    tokenomics.circulatingSupply = changes.circulatingSupply;
  }
  if (changes.burnedSupply !== undefined) {
    tokenomics.burnedSupply = changes.burnedSupply;
  }
  if (changes.price !== undefined) {
    tokenomics.price = changes.price;
  }
  
  // Update UI elements
  updateTokenUI();
  
  // Synchronize with token contract
  if (tokenomics.tokenContract) {
    if (tokenomics.tokenContract.tokenDetails) {
      tokenomics.tokenContract.tokenDetails.maxSupply = tokenomics.totalSupply;
      tokenomics.tokenContract.tokenDetails.circulatingSupply = tokenomics.circulatingSupply;
      tokenomics.tokenContract.tokenDetails.burned = tokenomics.burnedSupply;
    }
  }
  
  // Synchronize with token state for price effects
  if (window.tokenState) {
    window.tokenState.totalSupply = tokenomics.totalSupply;
    window.tokenState.circulatingSupply = tokenomics.circulatingSupply;
    window.tokenState.burnedTokens = tokenomics.burnedSupply;
  }
  
  // Synchronize with liquidity pool
  if (window.liquidityPool) {
    window.liquidityPool.totalSupply = tokenomics.totalSupply;
    window.liquidityPool.circulatingSupply = tokenomics.circulatingSupply;
    window.liquidityPool.burnedSupply = tokenomics.burnedSupply;
  }
}

/**
 * Update UI elements with current token metrics
 */
function updateTokenUI() {
  // Update supply displays
  const totalSupplyElements = document.querySelectorAll('.total-supply');
  const circulatingSupplyElements = document.querySelectorAll('.circulating-supply');
  const burnedSupplyElements = document.querySelectorAll('.burned-supply');
  
  totalSupplyElements.forEach(el => {
    el.textContent = tokenomics.totalSupply.toLocaleString();
  });
  
  circulatingSupplyElements.forEach(el => {
    el.textContent = tokenomics.circulatingSupply.toLocaleString();
  });
  
  burnedSupplyElements.forEach(el => {
    el.textContent = tokenomics.burnedSupply.toLocaleString();
  });
  
  // Update price displays
  const priceElements = document.querySelectorAll('.token-price');
  priceElements.forEach(el => {
    el.textContent = `${tokenomics.price.toFixed(6)} AVAX`;
  });
  
  // Update status indicators
  updateConnectionUI();
}

/**
 * Update UI elements based on connection status
 */
function updateConnectionUI() {
  // Update connection status displays
  const statusElements = document.querySelectorAll('.connection-status');
  const connectButtons = document.querySelectorAll('.connect-wallet-button');
  
  // Status classes
  statusElements.forEach(el => {
    el.classList.remove('status-connected', 'status-readonly', 'status-offline');
    
    if (tokenomics.connectedAccount) {
      el.classList.add('status-connected');
      el.textContent = 'Connected';
    } else if (tokenomics.readOnly) {
      el.classList.add('status-readonly');
      el.textContent = 'Read-Only';
    } else {
      el.classList.add('status-offline');
      el.textContent = 'Not Connected';
    }
  });
  
  // Connect wallet buttons
  connectButtons.forEach(button => {
    if (tokenomics.connectedAccount) {
      button.textContent = 'Wallet Connected';
      button.classList.add('connected');
      button.classList.remove('highlight-action');
    } else {
      button.textContent = 'Connect Wallet';
      button.classList.remove('connected');
      button.classList.add('highlight-action');
    }
  });
  
  // Enable/disable wallet-required actions
  const walletRequiredElements = document.querySelectorAll('.requires-wallet');
  walletRequiredElements.forEach(el => {
    if (tokenomics.connectedAccount) {
      el.disabled = false;
      el.classList.remove('disabled');
    } else {
      el.disabled = true;
      el.classList.add('disabled');
    }
  });
}

/**
 * Connect wallet
 */
async function connectWallet() {
  if (tokenomics.connectedAccount) {
    console.log('TokenomicsEngine: Wallet already connected');
    return tokenomics.connectedAccount;
  }
  
  try {
    // Request account access
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        tokenomics.connectedAccount = accounts[0];
        tokenomics.readOnly = false;
        
        console.log(`TokenomicsEngine: Connected to wallet ${tokenomics.connectedAccount}`);
        
        // Update UI
        updateConnectionUI();
        
        // Dispatch wallet connected event
        document.dispatchEvent(new CustomEvent('wallet-connected', {
          detail: { address: tokenomics.connectedAccount }
        }));
        
        return tokenomics.connectedAccount;
      }
    } else {
      console.warn('TokenomicsEngine: No Ethereum provider found');
      tokenomics.readOnly = true;
      updateConnectionUI();
    }
  } catch (error) {
    console.error('TokenomicsEngine: Failed to connect wallet:', error);
    tokenomics.readOnly = true;
    updateConnectionUI();
  }
  
  return null;
}

/**
 * Get current user address
 */
function getCurrentUserAddress() {
  return tokenomics.connectedAccount;
}

/**
 * Check if wallet is connected
 */
function isWalletConnected() {
  return !!tokenomics.connectedAccount;
}

/**
 * Check if in read-only mode
 */
function isReadOnly() {
  return tokenomics.readOnly;
}

/**
 * Get token balance for current user
 */
async function getUserTokenBalance() {
  if (!tokenomics.connectedAccount) {
    return 0;
  }
  
  try {
    if (tokenomics.tokenContract) {
      return await tokenomics.tokenContract.getBalance(tokenomics.connectedAccount);
    }
  } catch (error) {
    console.error('TokenomicsEngine: Error getting token balance:', error);
  }
  
  return 0;
}

/**
 * Burn tokens
 */
async function burnTokens(amount) {
  if (!tokenomics.connectedAccount || tokenomics.readOnly) {
    throw new Error('Wallet not connected');
  }
  
  if (!tokenomics.tokenContract) {
    throw new Error('Token contract not initialized');
  }
  
  try {
    const result = await tokenomics.tokenContract.burnTokens(
      tokenomics.connectedAccount, 
      amount
    );
    
    // Update burned supply
    updateTokenMetrics({
      burnedSupply: tokenomics.burnedSupply + amount,
      circulatingSupply: tokenomics.circulatingSupply - amount
    });
    
    // Dispatch token burned event
    document.dispatchEvent(new CustomEvent('token-burned', {
      detail: { amount: amount, txHash: result.transactionHash }
    }));
    
    return result;
  } catch (error) {
    console.error('TokenomicsEngine: Error burning tokens:', error);
    throw error;
  }
}

/**
 * Buy tokens
 */
async function buyTokens(avaxAmount) {
  if (!tokenomics.connectedAccount || tokenomics.readOnly) {
    throw new Error('Wallet not connected');
  }
  
  if (!tokenomics.tokenContract) {
    throw new Error('Token contract not initialized');
  }
  
  try {
    const result = await tokenomics.tokenContract.buyTokens(
      tokenomics.connectedAccount, 
      avaxAmount
    );
    
    // Estimate tokens received (this would normally come from the event logs)
    const tokensReceived = avaxAmount / tokenomics.price;
    
    // Update circulating supply
    updateTokenMetrics({
      circulatingSupply: tokenomics.circulatingSupply + tokensReceived
    });
    
    // Dispatch token bought event
    document.dispatchEvent(new CustomEvent('token-bought', {
      detail: { amount: tokensReceived, avaxAmount: avaxAmount, txHash: result.transactionHash }
    }));
    
    return result;
  } catch (error) {
    console.error('TokenomicsEngine: Error buying tokens:', error);
    throw error;
  }
}

/**
 * Sell tokens
 */
async function sellTokens(tokenAmount) {
  if (!tokenomics.connectedAccount || tokenomics.readOnly) {
    throw new Error('Wallet not connected');
  }
  
  if (!tokenomics.tokenContract) {
    throw new Error('Token contract not initialized');
  }
  
  try {
    const result = await tokenomics.tokenContract.sellTokens(
      tokenomics.connectedAccount, 
      tokenAmount
    );
    
    // Update circulating supply
    updateTokenMetrics({
      circulatingSupply: tokenomics.circulatingSupply - tokenAmount
    });
    
    // Dispatch token sold event
    document.dispatchEvent(new CustomEvent('token-sold', {
      detail: { amount: tokenAmount, txHash: result.transactionHash }
    }));
    
    return result;
  } catch (error) {
    console.error('TokenomicsEngine: Error selling tokens:', error);
    throw error;
  }
}

// Export functions for global use
window.tokenomics = {
  connect: connectWallet,
  getCurrentUserAddress,
  isWalletConnected,
  isReadOnly,
  getUserTokenBalance,
  burnTokens,
  buyTokens,
  sellTokens
};