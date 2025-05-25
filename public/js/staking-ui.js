/**
 * Staking and Rewards UI for The Nothing App
 * Handles the user interface for the advanced tokenomics features
 */

// Keep track of user data
const stakingData = {
  userAddress: null,
  userBalance: 0,
  stakeAmount: 0,
  stakeDuration: 30, // Default 30 days
  calculatedApy: 0.12, // Start with base APY
  estimatedRewards: 0,
  totalReturn: 0,
  userStakes: []
};

// DOM Elements
const stakeAmountInput = document.getElementById('stake-amount');
const stakeDurationInput = document.getElementById('stake-duration');
const durationValueDisplay = document.getElementById('duration-value');
const summaryAmount = document.getElementById('summary-amount');
const summaryPeriod = document.getElementById('summary-period');
const summaryApy = document.getElementById('summary-apy');
const summaryRewards = document.getElementById('summary-rewards');
const summaryTotal = document.getElementById('summary-total');
const stakeButton = document.getElementById('stake-button');
const stakingTotalDisplay = document.getElementById('staking-total');
const stakingRewardsDisplay = document.getElementById('staking-rewards');
const stakesListContainer = document.getElementById('stakes-list');
const claimAllRewardsButton = document.getElementById('claim-all-rewards');
const totalEarnedRewardsDisplay = document.getElementById('total-earned-rewards');
const currentRewardsRateDisplay = document.getElementById('current-rewards-rate');
const nextRewardDisplay = document.getElementById('next-reward');

// Set up tab switching
const setupTabs = () => {
  const tabs = document.querySelectorAll('.staking-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Show corresponding content
      const tabName = tab.getAttribute('data-tab');
      document.getElementById(`${tabName}-tab`).classList.add('active');
      
      // If showing my stakes tab, refresh the stakes
      if (tabName === 'my-stakes') {
        refreshStakesList();
      }
      
      // If showing rewards tab, refresh rewards
      if (tabName === 'rewards') {
        refreshRewardsDisplay();
      }
    });
  });
};

// Initialize staking UI
const initStakingUI = async () => {
  // Set up event listeners
  setupInputListeners();
  setupTabs();
  
  // Check if wallet is connected
  updateUserInfo();
  
  // Set up event listener for wallet connection
  document.addEventListener('wallet-connected', (event) => {
    if (event.detail && event.detail.address) {
      updateUserInfo(event.detail.address);
    }
  });
  
  // Set up interval to update rewards regularly
  setInterval(updateLiveRewards, 10000); // Update every 10 seconds
};

// Set up input listeners for staking form
const setupInputListeners = () => {
  // Stake amount input
  stakeAmountInput.addEventListener('input', () => {
    stakingData.stakeAmount = parseFloat(stakeAmountInput.value) || 0;
    updateStakingSummary();
    validateStakeForm();
  });
  
  // Stake duration input (slider)
  stakeDurationInput.addEventListener('input', () => {
    stakingData.stakeDuration = parseInt(stakeDurationInput.value);
    durationValueDisplay.textContent = stakingData.stakeDuration;
    updateStakingSummary();
    validateStakeForm();
  });
  
  // Stake button
  stakeButton.addEventListener('click', handleStakeSubmit);
  
  // Claim all rewards button
  claimAllRewardsButton.addEventListener('click', handleClaimAllRewards);
};

// Update user information from wallet and tokenomics engine
const updateUserInfo = async (address) => {
  // If address is provided, use it. Otherwise try to get from connector
  if (address) {
    stakingData.userAddress = address;
  } else if (window.avalancheConnector && window.avalancheConnector.isConnected) {
    stakingData.userAddress = await window.avalancheConnector.getConnectedAddress();
  }
  
  if (!stakingData.userAddress) {
    console.log('No wallet connected for staking');
    return;
  }
  
  // Get user balance
  if (window.nothingToken) {
    try {
      stakingData.userBalance = await window.nothingToken.getBalance(stakingData.userAddress);
    } catch (error) {
      console.error('Error getting token balance:', error);
      stakingData.userBalance = 0;
    }
  }
  
  // Update staking data from tokenomics engine
  if (window.tokenomicsEngine) {
    // Get user stakes
    stakingData.userStakes = window.tokenomicsEngine.getUserStakes(stakingData.userAddress);
    
    // Get total staked
    const totalStaked = window.tokenomicsEngine.getUserTotalStaked(stakingData.userAddress);
    stakingTotalDisplay.textContent = `${totalStaked.toFixed(2)} NTH`;
    
    // Get total rewards
    const totalRewards = window.tokenomicsEngine.getUserTotalRewards(stakingData.userAddress);
    stakingRewardsDisplay.textContent = `${totalRewards.toFixed(2)} NTH`;
    
    // Enable/disable claim rewards button
    claimAllRewardsButton.disabled = totalRewards <= 0;
  }
  
  // Refresh stakes list
  refreshStakesList();
  
  // Refresh rewards display
  refreshRewardsDisplay();
  
  // Validate stake form
  validateStakeForm();
};

// Update the staking summary based on user inputs
const updateStakingSummary = () => {
  // Update amount display
  summaryAmount.textContent = `${stakingData.stakeAmount.toFixed(2)} NTH`;
  
  // Update period display
  summaryPeriod.textContent = `${stakingData.stakeDuration} days`;
  
  // Calculate and update APY
  if (window.tokenomicsEngine) {
    stakingData.calculatedApy = window.tokenomicsEngine.calculateAPY(stakingData.stakeDuration);
  } else {
    // Fallback calculation if engine not available
    stakingData.calculatedApy = 0.12; // Base APY
    if (stakingData.stakeDuration >= 30) {
      // Add bonus for longer stakes
      const bonusFactor = Math.min(1, (stakingData.stakeDuration - 30) / 335);
      stakingData.calculatedApy += 0.08 * bonusFactor;
    }
  }
  summaryApy.textContent = `${(stakingData.calculatedApy * 100).toFixed(1)}%`;
  
  // Calculate estimated rewards
  const daysInYear = 365;
  const stakingPeriodYears = stakingData.stakeDuration / daysInYear;
  stakingData.estimatedRewards = stakingData.stakeAmount * stakingData.calculatedApy * stakingPeriodYears;
  
  // Apply daily compounding
  const dailyRate = stakingData.calculatedApy / daysInYear;
  let principal = stakingData.stakeAmount;
  for (let i = 0; i < stakingData.stakeDuration; i++) {
    principal += principal * dailyRate;
  }
  stakingData.estimatedRewards = principal - stakingData.stakeAmount;
  
  summaryRewards.textContent = `${stakingData.estimatedRewards.toFixed(2)} NTH`;
  
  // Calculate total return
  stakingData.totalReturn = stakingData.stakeAmount + stakingData.estimatedRewards;
  summaryTotal.textContent = `${stakingData.totalReturn.toFixed(2)} NTH`;
};

// Validate the staking form
const validateStakeForm = () => {
  // Validate user is connected
  if (!stakingData.userAddress) {
    stakeButton.disabled = true;
    stakeButton.textContent = 'Connect Wallet First';
    return;
  }
  
  // Validate amount
  if (!stakingData.stakeAmount || stakingData.stakeAmount < 10) {
    stakeButton.disabled = true;
    stakeButton.textContent = 'Minimum 10 NTH Required';
    return;
  }
  
  if (stakingData.stakeAmount > 10000) {
    stakeButton.disabled = true;
    stakeButton.textContent = 'Maximum 10,000 NTH Allowed';
    return;
  }
  
  // Validate balance
  if (stakingData.stakeAmount > stakingData.userBalance) {
    stakeButton.disabled = true;
    stakeButton.textContent = 'Insufficient Balance';
    return;
  }
  
  // All validations passed
  stakeButton.disabled = false;
  stakeButton.textContent = 'Stake Now';
};

// Handle stake submission
const handleStakeSubmit = async () => {
  if (!stakingData.userAddress || !window.tokenomicsEngine) {
    console.error('Wallet not connected or tokenomics engine not available');
    return;
  }
  
  try {
    // Disable button while processing
    stakeButton.disabled = true;
    stakeButton.textContent = 'Processing...';
    
    // Call tokenomics engine to stake tokens
    const stake = await window.tokenomicsEngine.stakeTokens(
      stakingData.userAddress,
      stakingData.stakeAmount,
      stakingData.stakeDuration
    );
    
    // Show success message
    showMessage(`Successfully staked ${stakingData.stakeAmount} NTH for ${stakingData.stakeDuration} days!`, false);
    
    // Update UI
    stakeAmountInput.value = '';
    stakingData.stakeAmount = 0;
    updateStakingSummary();
    
    // Update user info
    updateUserInfo();
    
    // Switch to my stakes tab
    document.querySelector('.staking-tab[data-tab="my-stakes"]').click();
  } catch (error) {
    console.error('Error staking tokens:', error);
    showMessage(`Error staking tokens: ${error.message}`, true);
  } finally {
    // Re-enable button
    validateStakeForm();
  }
};

// Refresh the stakes list display
const refreshStakesList = () => {
  if (!stakingData.userAddress || !stakesListContainer) return;
  
  // Get updated stakes
  if (window.tokenomicsEngine) {
    stakingData.userStakes = window.tokenomicsEngine.getUserStakes(stakingData.userAddress);
  }
  
  // Clear current content
  stakesListContainer.innerHTML = '';
  
  // If no stakes, show empty message
  if (!stakingData.userStakes || stakingData.userStakes.length === 0) {
    stakesListContainer.innerHTML = `
      <div class="no-stakes">
        <div class="no-stakes-icon">📈</div>
        <p>You have no active stakes.</p>
        <p>Start staking your NTH tokens to earn rewards!</p>
      </div>
    `;
    return;
  }
  
  // Add each stake to the list
  stakingData.userStakes.forEach(stake => {
    // Only show active and completed stakes
    if (stake.status === 'unstaked') return;
    
    // Calculate progress percentage
    const startTime = new Date(stake.startTime);
    const endTime = new Date(stake.endTime);
    const now = new Date();
    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    // Format dates
    const startDate = startTime.toLocaleDateString();
    const endDate = endTime.toLocaleDateString();
    
    // Create stake card
    const stakeCard = document.createElement('div');
    stakeCard.className = 'stake-card';
    stakeCard.innerHTML = `
      <div class="stake-header">
        <span class="stake-id">ID: ${stake.id.substring(0, 8)}...</span>
        <span class="stake-status ${stake.status}">${stake.status.charAt(0).toUpperCase() + stake.status.slice(1)}</span>
      </div>
      
      <div class="stake-amounts">
        <div class="stake-amount">${stake.amount.toFixed(2)} NTH</div>
        <div class="stake-amount stake-rewards">+${stake.rewards.toFixed(2)} NTH</div>
      </div>
      
      <div class="stake-details">
        <div class="stake-detail-label">APY:</div>
        <div class="stake-detail-value">${(stake.apy * 100).toFixed(1)}%</div>
        
        <div class="stake-detail-label">Start Date:</div>
        <div class="stake-detail-value">${startDate}</div>
        
        <div class="stake-detail-label">End Date:</div>
        <div class="stake-detail-value">${endDate}</div>
        
        <div class="stake-detail-label">Duration:</div>
        <div class="stake-detail-value">${stake.duration / 86400} days</div>
      </div>
      
      <div class="stake-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div class="progress-labels">
          <div class="progress-start">${startDate}</div>
          <div class="progress-end">${endDate}</div>
        </div>
      </div>
      
      <div class="stake-actions">
        <button class="btn-unstake" data-stake-id="${stake.id}">Unstake & Claim</button>
        <button class="btn-compound" data-stake-id="${stake.id}">Compound Rewards</button>
      </div>
    `;
    
    // Add to container
    stakesListContainer.appendChild(stakeCard);
    
    // Add event listeners to buttons
    const unstakeButton = stakeCard.querySelector('.btn-unstake');
    unstakeButton.addEventListener('click', () => handleUnstake(stake.id));
    
    const compoundButton = stakeCard.querySelector('.btn-compound');
    compoundButton.addEventListener('click', () => handleCompound(stake.id));
  });
};

// Handle unstaking tokens
const handleUnstake = async (stakeId) => {
  if (!stakingData.userAddress || !window.tokenomicsEngine) {
    console.error('Wallet not connected or tokenomics engine not available');
    return;
  }
  
  try {
    // Confirm unstaking
    if (!confirm('Are you sure you want to unstake these tokens? Early withdrawal may incur fees.')) {
      return;
    }
    
    // Call tokenomics engine to unstake
    const result = await window.tokenomicsEngine.unstakeTokens(stakingData.userAddress, stakeId);
    
    // Show success message
    const message = result.isEarlyWithdrawal
      ? `Unstaked ${result.originalAmount} NTH with a fee of ${result.withdrawalFee.toFixed(2)} NTH. Received ${result.totalReturned.toFixed(2)} NTH.`
      : `Successfully unstaked ${result.originalAmount} NTH and claimed ${result.rewards.toFixed(2)} NTH in rewards!`;
    
    showMessage(message, false);
    
    // Update UI
    updateUserInfo();
  } catch (error) {
    console.error('Error unstaking tokens:', error);
    showMessage(`Error unstaking tokens: ${error.message}`, true);
  }
};

// Handle compounding rewards
const handleCompound = async (stakeId) => {
  // In a real implementation, this would send a transaction to compound rewards
  // For now, we'll just show a message
  showMessage('Rewards compounding is automatic in this version. No action needed!', false);
};

// Handle claiming all rewards
const handleClaimAllRewards = async () => {
  if (!stakingData.userAddress || !window.tokenomicsEngine) {
    console.error('Wallet not connected or tokenomics engine not available');
    return;
  }
  
  try {
    // For now, just show a message
    // In a real implementation, this would claim all rewards across stakes
    const totalRewards = window.tokenomicsEngine.getUserTotalRewards(stakingData.userAddress);
    showMessage(`This would claim ${totalRewards.toFixed(2)} NTH in rewards. Feature coming soon!`, false);
  } catch (error) {
    console.error('Error claiming rewards:', error);
    showMessage(`Error claiming rewards: ${error.message}`, true);
  }
};

// Refresh the rewards display
const refreshRewardsDisplay = () => {
  if (!stakingData.userAddress) return;
  
  // Calculate total earned rewards (all time)
  let totalEarned = 0;
  
  // Calculate current rewards rate (per day)
  let dailyRewardsRate = 0;
  
  if (window.tokenomicsEngine) {
    // Get active stakes
    const activeStakes = stakingData.userStakes.filter(stake => stake.status === 'active');
    
    // Calculate daily rewards rate
    activeStakes.forEach(stake => {
      const dailyRate = stake.apy / 365;
      dailyRewardsRate += stake.amount * dailyRate;
    });
    
    // Include compound effect
    const withCompound = dailyRewardsRate * 1.1; // Approximate compound effect
    
    // Update displays
    totalEarnedRewardsDisplay.textContent = `${totalEarned.toFixed(2)} NTH`;
    currentRewardsRateDisplay.textContent = `${withCompound.toFixed(2)} NTH/day`;
    
    // Calculate time until next reward (daily compounding)
    // For demonstration, we'll just show a countdown to midnight
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilNextReward = tomorrow - now;
    const hours = Math.floor(timeUntilNextReward / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilNextReward % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilNextReward % (1000 * 60)) / 1000);
    
    nextRewardDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
};

// Update live rewards display
const updateLiveRewards = () => {
  if (window.tokenomicsEngine) {
    // Update rewards for all stakes
    window.tokenomicsEngine.updateAllRewards();
    
    // Update UI if user is connected
    if (stakingData.userAddress) {
      // Update rewards display
      const totalRewards = window.tokenomicsEngine.getUserTotalRewards(stakingData.userAddress);
      stakingRewardsDisplay.textContent = `${totalRewards.toFixed(2)} NTH`;
      
      // Update current tab content
      const activeTab = document.querySelector('.staking-tab.active');
      if (activeTab) {
        const tabName = activeTab.getAttribute('data-tab');
        if (tabName === 'my-stakes') {
          refreshStakesList();
        } else if (tabName === 'rewards') {
          refreshRewardsDisplay();
        }
      }
      
      // Enable/disable claim rewards button
      claimAllRewardsButton.disabled = totalRewards <= 0;
    }
  }
};

// Show a message to the user
const showMessage = (message, isError = false) => {
  // Try to use the app's existing message function if available
  if (typeof window.showTokenMessage === 'function') {
    window.showTokenMessage(message, isError);
  } else {
    // Fallback to alert
    if (isError) {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initStakingUI);