/**
 * Token Governance System for The Nothing App
 * Allows token holders to propose and vote on token supply changes
 * Runs directly on the Avalanche L1 blockchain
 */

// Governance contract address on Avalanche L1
const GOVERNANCE_CONTRACT_ADDRESS = '0x4fB87c52Bb6D194f78cd4896E3e574028fedBAE9';

// Governance ABI (simplified for demonstration)
const GOVERNANCE_ABI = [
  {
    "inputs": [
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "proposedSupply", "type": "uint256" }
    ],
    "name": "createProposal",
    "outputs": [{ "name": "proposalId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "proposalId", "type": "uint256" },
      { "name": "support", "type": "bool" }
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "proposalId", "type": "uint256" }
    ],
    "name": "executeProposal",
    "outputs": [{ "name": "success", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposalCount",
    "outputs": [{ "name": "count", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "proposalId", "type": "uint256" }
    ],
    "name": "getProposal",
    "outputs": [
      { "name": "id", "type": "uint256" },
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "proposedSupply", "type": "uint256" },
      { "name": "proposer", "type": "address" },
      { "name": "votesFor", "type": "uint256" },
      { "name": "votesAgainst", "type": "uint256" },
      { "name": "startTime", "type": "uint256" },
      { "name": "endTime", "type": "uint256" },
      { "name": "executed", "type": "bool" },
      { "name": "status", "type": "uint8" } // 0=active, 1=passed, 2=rejected, 3=failed_quorum
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Governance state (will be synced with blockchain)
let governance = {
  proposals: [], // List of active and past proposals
  nextProposalId: 1, // Counter for proposal IDs
  quorumPercentage: 10, // Percentage of total supply needed for a proposal to pass
  votingPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  minimumHoldingPercentage: 0.5, // Minimum percentage of tokens to create proposal (0.5%)
  voterRegistry: {}, // Track who has voted on which proposals
  executed: {}, // Track which proposals have been executed
  contract: null // Governance contract instance
};

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize governance UI
  initGovernanceUI();
  
  // Set up event listeners
  setupGovernanceListeners();
  
  // Wait for Avalanche connector to be initialized first
  console.log('Waiting for Avalanche connector initialization...');
  setTimeout(async () => {
    // Initialize blockchain connection
    await initBlockchainConnection();
    
    // Load proposals - will automatically fall back to local storage if blockchain unavailable
    try {
      await loadProposalsFromBlockchain();
    } catch (error) {
      console.error('Error loading proposals from blockchain, using local storage:', error);
      loadProposalsFromLocalStorage();
    }
    
    // Update voting power
    await updateVotingPower();
    
    console.log('Governance system fully initialized');
  }, 2000); // Wait 2 seconds for avalanche connector to initialize
  
  // Listen for wallet connection to update voting power
  document.addEventListener('wallet-connected', async function() {
    console.log('Wallet connected, updating governance system');
    await updateVotingPower();
    await loadProposalsFromBlockchain();
  });
});

/**
 * Initialize connection to Avalanche L1 blockchain
 */
async function initBlockchainConnection() {
  try {
    // First try to initialize using existing web3 instance
    if (window.web3 || window.ethereum) {
      const provider = window.ethereum || window.web3.currentProvider;
      const web3 = new Web3(provider);
      
      console.log('Using existing Web3 provider');
      governance.contract = new web3.eth.Contract(GOVERNANCE_ABI, GOVERNANCE_CONTRACT_ADDRESS);
      
      // Update UI
      showGovernanceMessage('Connected to Avalanche L1 governance contract', false);
      console.log('Governance contract initialized on Avalanche L1');
      return;
    }
    
    // If no direct web3, try avalancheConnector
    if (window.avalancheConnector && window.avalancheConnector.web3) {
      console.log('Using Avalanche connector Web3 instance');
      const web3 = window.avalancheConnector.web3;
      governance.contract = new web3.eth.Contract(GOVERNANCE_ABI, GOVERNANCE_CONTRACT_ADDRESS);
      
      // Update UI
      showGovernanceMessage('Connected to Avalanche L1 governance contract', false);
      console.log('Governance contract initialized on Avalanche L1');
      return;
    }
    
    // If still no Web3, wait for connector to be available
    console.log('Waiting for Avalanche connector...');
    const timeoutMs = 5000; // 5 seconds timeout
    const connector = await Promise.race([
      new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (window.avalancheConnector) {
            clearInterval(checkInterval);
            resolve(window.avalancheConnector);
          }
        }, 500);
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
      )
    ]);
    
    if (connector && connector.web3) {
      governance.contract = new connector.web3.eth.Contract(GOVERNANCE_ABI, GOVERNANCE_CONTRACT_ADDRESS);
      console.log('Governance contract initialized on Avalanche L1 (after waiting)');
      showGovernanceMessage('Connected to Avalanche L1 governance contract', false);
    } else {
      // Final fallback to just create a default Web3 instance
      console.log('Using fallback RPC URL for Avalanche Fuji C-Chain');
      const fallbackProvider = new Web3.providers.HttpProvider('https://api.avax-test.network/ext/bc/C/rpc');
      const fallbackWeb3 = new Web3(fallbackProvider);
      governance.contract = new fallbackWeb3.eth.Contract(GOVERNANCE_ABI, GOVERNANCE_CONTRACT_ADDRESS);
      
      // Show message about limited functionality
      showGovernanceMessage('Connected to Avalanche L1 in read-only mode. Connect wallet for full functionality.', false);
    }
  } catch (error) {
    console.error('Error initializing blockchain connection:', error);
    showGovernanceMessage('Error connecting to Avalanche blockchain. Using local storage fallback.', true);
    
    // We still need a minimal contract to prevent errors elsewhere
    governance.contract = {
      methods: {
        createProposal: () => ({ send: async () => ({ events: {} }) }),
        castVote: () => ({ send: async () => ({}) }),
        executeProposal: () => ({ send: async () => ({}) }),
        getProposalCount: () => ({ call: async () => "0" }),
        getProposal: () => ({ call: async () => ({
          id: "0", title: "", description: "", proposedSupply: "0",
          proposer: "0x0000000000000000000000000000000000000000",
          votesFor: "0", votesAgainst: "0", startTime: "0", endTime: "0",
          executed: false, status: "0"
        }) })
      }
    };
  }
}

/**
 * Initialize governance UI
 */
function initGovernanceUI() {
  // Update proposal list
  refreshProposalList();
  
  // Show current voting power if user is connected
  updateVotingPower();
}

/**
 * Set up event listeners for governance features
 */
function setupGovernanceListeners() {
  // Create proposal form
  const createProposalForm = document.getElementById('create-proposal-form');
  if (createProposalForm) {
    createProposalForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleCreateProposal();
    });
  }
  
  // Listen for wallet connection events to update voting power
  document.addEventListener('wallet-connected', function(e) {
    updateVotingPower();
  });
}

/**
 * Handle creating a new proposal on Avalanche L1 blockchain
 */
async function handleCreateProposal() {
  const titleInput = document.getElementById('proposal-title');
  const descriptionInput = document.getElementById('proposal-description');
  const newSupplyInput = document.getElementById('proposal-supply');
  
  if (!titleInput || !descriptionInput || !newSupplyInput) {
    showGovernanceMessage('Proposal form elements not found', true);
    return;
  }
  
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const newSupplyStr = newSupplyInput.value.replace(/,/g, '');
  const newSupply = parseFloat(newSupplyStr);
  
  // Validate inputs
  if (!title || !description) {
    showGovernanceMessage('Please provide a title and description', true);
    return;
  }
  
  if (isNaN(newSupply) || newSupply < 10000000000) {
    showGovernanceMessage('Supply must be at least 10,000,000,000', true);
    return;
  }
  
  // Get user address
  const userAddress = getCurrentUserAddress();
  if (!userAddress) {
    showGovernanceMessage('Please connect your wallet first', true);
    return;
  }
  
  // Check if user has enough tokens to create a proposal
  const userBalance = await getNthBalanceFromBlockchain(userAddress);
  const totalSupply = getTotalSupply();
  const minimumRequired = totalSupply * (governance.minimumHoldingPercentage / 100);
  
  if (userBalance < minimumRequired) {
    showGovernanceMessage(`You need at least ${minimumRequired.toLocaleString()} NTH tokens (${governance.minimumHoldingPercentage}% of supply) to create a proposal`, true);
    return;
  }
  
  try {
    // Check if blockchain connection is available
    if (!governance.contract || !window.avalancheConnector || !window.avalancheConnector.web3) {
      throw new Error('Blockchain connection not available');
    }
    
    // Show pending message
    showGovernanceMessage('Creating proposal on Avalanche L1 blockchain...', false);
    
    // Create the proposal on the blockchain
    const web3 = window.avalancheConnector.web3;
    const result = await governance.contract.methods.createProposal(
      title,
      description,
      web3.utils.toBN(newSupply.toString())
    ).send({ from: userAddress });
    
    // Get the proposal ID from the result
    const proposalId = result.events.ProposalCreated ? 
      parseInt(result.events.ProposalCreated.returnValues.proposalId) : 
      governance.nextProposalId;
    
    console.log(`Proposal created on blockchain with ID: ${proposalId}`);
    
    // Show success message
    showGovernanceMessage(`Proposal #${proposalId} created successfully on Avalanche L1. Voting period has begun.`, false);
    
    // Reload proposals from blockchain
    await loadProposalsFromBlockchain();
    
    // Reset form
    titleInput.value = '';
    descriptionInput.value = '';
    newSupplyInput.value = '';
  } catch (error) {
    console.error('Error creating proposal on blockchain:', error);
    showGovernanceMessage('Error creating proposal: ' + error.message, true);
    
    // Fallback to local storage for demo
    createProposalLocally(title, description, newSupply, userAddress, userBalance);
  }
}

/**
 * Fallback: Create proposal locally for demo purposes
 */
function createProposalLocally(title, description, newSupply, userAddress, userBalance) {
  console.log('Creating proposal locally (blockchain fallback)');
  
  // Create the proposal
  const proposal = {
    id: governance.nextProposalId++,
    title: title,
    description: description,
    proposedSupply: newSupply,
    proposer: userAddress,
    createdAt: Date.now(),
    endTime: Date.now() + governance.votingPeriod,
    votes: {
      for: userBalance, // Proposer automatically votes in favor
      against: 0
    },
    voters: {
      [userAddress]: {
        vote: 'for',
        weight: userBalance,
        timestamp: Date.now()
      }
    },
    status: 'active'
  };
  
  // Add to proposals
  governance.proposals.push(proposal);
  
  // Register that this user has voted
  if (!governance.voterRegistry[userAddress]) {
    governance.voterRegistry[userAddress] = [];
  }
  governance.voterRegistry[userAddress].push(proposal.id);
  
  // Save proposals to storage
  saveProposalsToLocalStorage();
  
  // Update UI
  refreshProposalList();
  
  // Show success message
  showGovernanceMessage(`Proposal #${proposal.id} created locally (blockchain unavailable). Voting period ends in 7 days.`, false);
}

/**
 * Handle voting on a proposal on Avalanche L1 blockchain
 * @param {number} proposalId - ID of the proposal
 * @param {string} vote - 'for' or 'against'
 */
async function handleVote(proposalId, vote) {
  // Get user address
  const userAddress = getCurrentUserAddress();
  if (!userAddress) {
    showGovernanceMessage('Please connect your wallet first', true);
    return;
  }
  
  // Find the proposal
  const proposal = governance.proposals.find(p => p.id === proposalId);
  if (!proposal) {
    showGovernanceMessage('Proposal not found', true);
    return;
  }
  
  // Check if voting period is still active
  if (Date.now() > proposal.endTime) {
    showGovernanceMessage('Voting period has ended for this proposal', true);
    return;
  }
  
  // Get user's voting power (token balance) from blockchain
  const votingPower = await getNthBalanceFromBlockchain(userAddress);
  if (votingPower <= 0) {
    showGovernanceMessage('You need to hold NTH tokens to vote', true);
    return;
  }
  
  try {
    // Check if blockchain connection is available
    if (!governance.contract || !window.avalancheConnector || !window.avalancheConnector.web3) {
      throw new Error('Blockchain connection not available');
    }
    
    // Show pending message
    showGovernanceMessage(`Submitting your vote on Avalanche L1 blockchain...`, false);
    
    // Cast the vote on blockchain
    const voteSupport = vote === 'for';
    await governance.contract.methods.castVote(
      proposalId,
      voteSupport
    ).send({ from: userAddress });
    
    console.log(`Vote cast on blockchain for proposal ${proposalId}: ${vote}`);
    
    // Show success message
    showGovernanceMessage(`Your vote for proposal #${proposalId} has been recorded on Avalanche L1`, false);
    
    // Reload proposals from blockchain to get updated vote counts
    await loadProposalsFromBlockchain();
  } catch (error) {
    console.error('Error voting on blockchain:', error);
    showGovernanceMessage('Error submitting vote: ' + error.message, true);
    
    // Fallback to local storage for demo
    voteLocally(proposalId, vote, userAddress, votingPower);
  }
}

/**
 * Fallback: Vote locally for demo purposes
 */
function voteLocally(proposalId, vote, userAddress, votingPower) {
  console.log('Voting locally (blockchain fallback)');
  
  // Find the proposal
  const proposal = governance.proposals.find(p => p.id === proposalId);
  if (!proposal) {
    showGovernanceMessage('Proposal not found', true);
    return;
  }
  
  // Check if user has already voted locally
  if (governance.voterRegistry[userAddress] && governance.voterRegistry[userAddress].includes(proposalId)) {
    showGovernanceMessage('You have already voted on this proposal', true);
    return;
  }
  
  // Record the vote
  if (vote === 'for') {
    proposal.votes.for += votingPower;
  } else {
    proposal.votes.against += votingPower;
  }
  
  // Record voter information
  proposal.voters[userAddress] = {
    vote: vote,
    weight: votingPower,
    timestamp: Date.now()
  };
  
  // Register that this user has voted
  if (!governance.voterRegistry[userAddress]) {
    governance.voterRegistry[userAddress] = [];
  }
  governance.voterRegistry[userAddress].push(proposalId);
  
  // Check if the proposal has reached quorum and passed
  checkProposalStatus(proposal);
  
  // Save proposals to local storage
  saveProposalsToLocalStorage();
  
  // Update UI
  refreshProposalList();
  
  // Show success message
  showGovernanceMessage(`Your vote for proposal #${proposalId} has been recorded locally (blockchain unavailable)`, false);
}

/**
 * Get NTH token balance from blockchain
 * @param {string} address - User's wallet address
 * @returns {number} - User's NTH balance
 */
async function getNthBalanceFromBlockchain(address) {
  try {
    if (!window.nothingToken || !window.nothingToken.getBalance) {
      throw new Error('Nothing Token contract not available');
    }
    
    const balance = await window.nothingToken.getBalance(address);
    return parseFloat(balance);
  } catch (error) {
    console.error('Error getting token balance from blockchain:', error);
    // Fallback to UI balance display
    return getUserNthBalance();
  }
}

/**
 * Check if a proposal has passed or failed
 * @param {Object} proposal - The proposal to check
 */
function checkProposalStatus(proposal) {
  // If proposal has already ended, don't change status
  if (proposal.status !== 'active') {
    return;
  }
  
  // Check if voting period has ended
  if (Date.now() > proposal.endTime) {
    const totalVotes = proposal.votes.for + proposal.votes.against;
    const totalSupply = getTotalSupply();
    
    // Check if quorum is reached (minimum percentage of total supply)
    const quorumThreshold = totalSupply * (governance.quorumPercentage / 100);
    
    if (totalVotes >= quorumThreshold) {
      // Check if proposal passed
      if (proposal.votes.for > proposal.votes.against) {
        proposal.status = 'passed';
        // Execute the proposal
        executeProposal(proposal);
      } else {
        proposal.status = 'rejected';
      }
    } else {
      proposal.status = 'failed_quorum';
    }
  }
  
  // Special case: If the proposal has overwhelming support early (>75% of supply and 5x more votes in favor)
  const totalSupply = getTotalSupply();
  const earlyPassThreshold = totalSupply * 0.75;
  if (proposal.votes.for > earlyPassThreshold && proposal.votes.for > proposal.votes.against * 5) {
    proposal.status = 'passed';
    // Execute the proposal
    executeProposal(proposal);
  }
}

/**
 * Execute a passed proposal on Avalanche L1 blockchain
 * @param {Object} proposal - The passed proposal to execute
 */
async function executeProposal(proposal) {
  // Check if proposal has already been executed
  if (proposal.executed) {
    return;
  }
  
  try {
    // Check if blockchain connection is available
    if (!governance.contract || !window.avalancheConnector || !window.avalancheConnector.web3) {
      throw new Error('Blockchain connection not available');
    }
    
    // Get user address
    const userAddress = getCurrentUserAddress();
    if (!userAddress) {
      showGovernanceMessage('Please connect your wallet to execute proposal', true);
      return;
    }
    
    // Show pending message
    showGovernanceMessage(`Executing proposal on Avalanche L1 blockchain...`, false);
    
    // Execute the proposal on blockchain
    const result = await governance.contract.methods.executeProposal(
      proposal.id
    ).send({ from: userAddress });
    
    console.log(`Proposal executed on blockchain: ${proposal.id}`);
    
    // Update token supply locally as well
    if (proposal.proposedSupply && window.liquidityPool && typeof window.liquidityPool.setTotalSupply === 'function') {
      window.liquidityPool.setTotalSupply(proposal.proposedSupply);
      
      // Update UI
      const currentSupplyEl = document.getElementById('current-supply');
      if (currentSupplyEl) {
        currentSupplyEl.textContent = proposal.proposedSupply.toLocaleString();
      }
    }
    
    // Show success message
    showGovernanceMessage(`Proposal #${proposal.id} has been executed on Avalanche L1. Max supply updated to ${proposal.proposedSupply.toLocaleString()}.`, false);
    
    // Reload proposals from blockchain
    await loadProposalsFromBlockchain();
  } catch (error) {
    console.error('Error executing proposal on blockchain:', error);
    showGovernanceMessage('Error executing proposal: ' + error.message, true);
    
    // Fallback to local execution for demo
    executeProposalLocally(proposal);
  }
}

/**
 * Fallback: Execute proposal locally for demo purposes
 */
function executeProposalLocally(proposal) {
  console.log('Executing proposal locally (blockchain fallback)');
  
  // Check if proposal has already been executed locally
  if (governance.executed[proposal.id]) {
    return;
  }
  
  // Execute based on proposal type (for now, just supply change)
  if (proposal.proposedSupply) {
    // Update the max supply
    if (window.liquidityPool && typeof window.liquidityPool.setTotalSupply === 'function') {
      const success = window.liquidityPool.setTotalSupply(proposal.proposedSupply);
      
      if (success) {
        // Mark as executed
        governance.executed[proposal.id] = {
          timestamp: Date.now(),
          executor: 'governance_system'
        };
        
        // Update the proposal's executed status
        proposal.executed = true;
        
        // Update UI
        const currentSupplyEl = document.getElementById('current-supply');
        if (currentSupplyEl) {
          currentSupplyEl.textContent = proposal.proposedSupply.toLocaleString();
        }
        
        // Save to local storage
        saveProposalsToLocalStorage();
        
        // Show success message
        showGovernanceMessage(`Proposal #${proposal.id} has been executed locally (blockchain unavailable). Max supply updated to ${proposal.proposedSupply.toLocaleString()}.`, false);
      }
    }
  }
}

/**
 * Refresh the proposal list in the UI
 */
function refreshProposalList() {
  const proposalListEl = document.getElementById('proposal-list');
  if (!proposalListEl) return;
  
  // Clear current list
  proposalListEl.innerHTML = '';
  
  // Check if there are any proposals
  if (governance.proposals.length === 0) {
    proposalListEl.innerHTML = `
      <div class="no-proposals">
        <p>No proposals yet. Create the first proposal!</p>
      </div>
    `;
    return;
  }
  
  // Sort proposals: active first, then by creation date (newest first)
  const sortedProposals = [...governance.proposals].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return b.createdAt - a.createdAt;
  });
  
  // Add each proposal to the list
  sortedProposals.forEach(proposal => {
    // Calculate time remaining for active proposals
    let timeRemaining = '';
    if (proposal.status === 'active') {
      const remainingMs = proposal.endTime - Date.now();
      if (remainingMs > 0) {
        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        timeRemaining = `${days}d ${hours}h remaining`;
      } else {
        timeRemaining = 'Voting ended, processing results...';
      }
    }
    
    // Calculate progress percentages
    const totalVotes = proposal.votes.for + proposal.votes.against;
    const forPercentage = totalVotes > 0 ? (proposal.votes.for / totalVotes * 100).toFixed(1) : '0';
    const againstPercentage = totalVotes > 0 ? (proposal.votes.against / totalVotes * 100).toFixed(1) : '0';
    
    // Get status display
    let statusDisplay = '';
    switch (proposal.status) {
      case 'active':
        statusDisplay = `<span class="status-active">Active</span>`;
        break;
      case 'passed':
        statusDisplay = `<span class="status-passed">Passed</span>`;
        break;
      case 'rejected':
        statusDisplay = `<span class="status-rejected">Rejected</span>`;
        break;
      case 'failed_quorum':
        statusDisplay = `<span class="status-failed">Failed (No Quorum)</span>`;
        break;
    }
    
    // Create proposal card
    const proposalCard = document.createElement('div');
    proposalCard.className = `proposal-card proposal-${proposal.status}`;
    proposalCard.innerHTML = `
      <div class="proposal-header">
        <div class="proposal-id">#${proposal.id}</div>
        ${statusDisplay}
      </div>
      
      <div class="proposal-title">${proposal.title}</div>
      <div class="proposal-description">${proposal.description}</div>
      
      <div class="proposal-details">
        <div class="proposal-detail">
          <span class="proposal-detail-label">Proposed Supply:</span>
          <span class="proposal-detail-value">${proposal.proposedSupply.toLocaleString()}</span>
        </div>
        <div class="proposal-detail">
          <span class="proposal-detail-label">Created By:</span>
          <span class="proposal-detail-value">${shortenAddress(proposal.proposer)}</span>
        </div>
        <div class="proposal-detail">
          <span class="proposal-detail-label">Created:</span>
          <span class="proposal-detail-value">${new Date(proposal.createdAt).toLocaleDateString()}</span>
        </div>
        ${proposal.status === 'active' ? `
          <div class="proposal-detail">
            <span class="proposal-detail-label">Time Remaining:</span>
            <span class="proposal-detail-value">${timeRemaining}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="vote-progress">
        <div class="vote-bar">
          <div class="vote-for" style="width: ${forPercentage}%"></div>
          <div class="vote-against" style="width: ${againstPercentage}%"></div>
        </div>
        <div class="vote-stats">
          <div class="vote-stat">
            <span class="vote-label">For:</span>
            <span class="vote-value">${proposal.votes.for.toLocaleString()} (${forPercentage}%)</span>
          </div>
          <div class="vote-stat">
            <span class="vote-label">Against:</span>
            <span class="vote-value">${proposal.votes.against.toLocaleString()} (${againstPercentage}%)</span>
          </div>
        </div>
      </div>
      
      ${proposal.status === 'active' ? `
        <div class="vote-actions">
          <button class="vote-btn vote-for-btn" onclick="handleVote(${proposal.id}, 'for')">Vote For</button>
          <button class="vote-btn vote-against-btn" onclick="handleVote(${proposal.id}, 'against')">Vote Against</button>
        </div>
      ` : ''}
    `;
    
    // Add to list
    proposalListEl.appendChild(proposalCard);
  });
}

/**
 * Update the user's voting power display from blockchain
 */
async function updateVotingPower() {
  const votingPowerEl = document.getElementById('voting-power');
  if (!votingPowerEl) return;
  
  const userAddress = getCurrentUserAddress();
  if (!userAddress) {
    votingPowerEl.textContent = 'Connect wallet to see voting power';
    return;
  }
  
  try {
    // Try to get balance from blockchain
    const votingPower = await getNthBalanceFromBlockchain(userAddress);
    votingPowerEl.textContent = votingPower.toLocaleString();
    
    // Also update other elements showing the same information
    const votingPowerElements = document.querySelectorAll('.voting-power-value');
    votingPowerElements.forEach(el => {
      if (el.id !== 'voting-power') { // Don't update the one we already did
        el.textContent = votingPower.toLocaleString();
      }
    });
    
    console.log(`Updated voting power for ${userAddress}: ${votingPower}`);
  } catch (error) {
    console.error('Error getting voting power from blockchain:', error);
    
    // Fallback to UI balance
    const votingPower = getUserNthBalance();
    votingPowerEl.textContent = votingPower.toLocaleString();
  }
}

/**
 * Load proposals from Avalanche L1 blockchain
 */
async function loadProposalsFromBlockchain() {
  try {
    if (!governance.contract) {
      console.error('Governance contract not initialized');
      return;
    }
    
    showGovernanceMessage('Loading proposals from Avalanche L1...', false);
    
    // Get proposal count from contract
    const proposalCount = await governance.contract.methods.getProposalCount().call();
    console.log(`Found ${proposalCount} proposals on Avalanche L1`);
    
    // Clear existing proposals
    governance.proposals = [];
    
    // Load each proposal
    for (let i = 1; i <= proposalCount; i++) {
      try {
        const proposalData = await governance.contract.methods.getProposal(i).call();
        
        // Map blockchain data to our proposal format
        const proposal = {
          id: parseInt(proposalData.id),
          title: proposalData.title,
          description: proposalData.description,
          proposedSupply: parseInt(proposalData.proposedSupply),
          proposer: proposalData.proposer,
          createdAt: parseInt(proposalData.startTime) * 1000, // Convert to milliseconds
          endTime: parseInt(proposalData.endTime) * 1000, // Convert to milliseconds
          votes: {
            for: parseInt(proposalData.votesFor),
            against: parseInt(proposalData.votesAgainst)
          },
          voters: {}, // We'll keep this empty as the contract tracks votes internally
          status: mapBlockchainStatus(parseInt(proposalData.status)),
          executed: proposalData.executed
        };
        
        governance.proposals.push(proposal);
      } catch (error) {
        console.error(`Error loading proposal ${i}:`, error);
      }
    }
    
    // Set next proposal ID
    governance.nextProposalId = parseInt(proposalCount) + 1;
    
    // Update UI
    refreshProposalList();
    
    showGovernanceMessage('Proposals loaded from Avalanche L1', false);
  } catch (error) {
    console.error('Error loading proposals from blockchain:', error);
    showGovernanceMessage('Error loading proposals: ' + error.message, true);
    
    // Fallback to loading from local storage
    loadProposalsFromLocalStorage();
  }
}

/**
 * Fallback: Load proposals from local storage
 */
function loadProposalsFromLocalStorage() {
  try {
    console.log('Falling back to local storage for proposals');
    const savedProposals = localStorage.getItem('nth_governance_proposals');
    if (savedProposals) {
      governance.proposals = JSON.parse(savedProposals);
    }
    
    const savedVoterRegistry = localStorage.getItem('nth_governance_voters');
    if (savedVoterRegistry) {
      governance.voterRegistry = JSON.parse(savedVoterRegistry);
    }
    
    const savedExecuted = localStorage.getItem('nth_governance_executed');
    if (savedExecuted) {
      governance.executed = JSON.parse(savedExecuted);
    }
    
    // Set next proposal ID
    if (governance.proposals.length > 0) {
      const maxId = Math.max(...governance.proposals.map(p => p.id));
      governance.nextProposalId = maxId + 1;
    }
    
    // Update proposal statuses
    governance.proposals.forEach(checkProposalStatus);
    
    // Update UI
    refreshProposalList();
  } catch (error) {
    console.error('Error loading proposals from local storage:', error);
  }
}

/**
 * Map blockchain status code to our status string
 * @param {number} statusCode - Blockchain status code
 * @returns {string} - Status string
 */
function mapBlockchainStatus(statusCode) {
  switch (statusCode) {
    case 0: return 'active';
    case 1: return 'passed';
    case 2: return 'rejected';
    case 3: return 'failed_quorum';
    default: return 'active';
  }
}

/**
 * Save proposals to local storage
 */
function saveProposalsToLocalStorage() {
  try {
    localStorage.setItem('nth_governance_proposals', JSON.stringify(governance.proposals));
    localStorage.setItem('nth_governance_voters', JSON.stringify(governance.voterRegistry));
    localStorage.setItem('nth_governance_executed', JSON.stringify(governance.executed));
  } catch (error) {
    console.error('Error saving proposals to local storage:', error);
  }
}

/**
 * Show a message in the governance section
 * @param {string} message - Message to show
 * @param {boolean} isError - Whether it's an error message
 */
function showGovernanceMessage(message, isError) {
  const messageEl = document.getElementById('governance-message');
  const errorEl = document.getElementById('governance-error');
  
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
 * Get total token supply
 * @returns {number} - Total token supply
 */
function getTotalSupply() {
  // Try to get from liquidity pool
  if (window.liquidityPool && typeof window.liquidityPool.getTotalSupply === 'function') {
    return window.liquidityPool.getTotalSupply();
  }
  
  // Default
  return 10000000000;
}

/**
 * Shorten an address for display
 * @param {string} address - Wallet address
 * @returns {string} - Shortened address
 */
function shortenAddress(address) {
  if (!address) return '';
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Expose governance functions to window
window.handleVote = handleVote;