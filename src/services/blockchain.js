import { ethers } from 'ethers';
import NothingTokenABI from '../contracts/NothingToken.json';
import { AVALANCHE_RPC_URL, NOTHING_TOKEN_ADDRESS } from '../constants';

// Create ethers provider for Avalanche C-Chain
const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(AVALANCHE_RPC_URL);
};

// Get contract instance
const getTokenContract = (signerOrProvider) => {
  return new ethers.Contract(
    NOTHING_TOKEN_ADDRESS,
    NothingTokenABI,
    signerOrProvider
  );
};

// Connect wallet and get signer
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('No wallet detected. Please install MetaMask or another Ethereum wallet.');
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    // Check if connected to Avalanche C-Chain (43114)
    const network = await provider.getNetwork();
    if (network.chainId !== 43114) {
      // Request chain switch to Avalanche C-Chain
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xA86A' }], // 43114 in hex
        });
      } catch (switchError) {
        // If chain doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xA86A',
                chainName: 'Avalanche C-Chain',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: [AVALANCHE_RPC_URL],
                blockExplorerUrls: ['https://snowtrace.io/'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    return { address, signer };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Check if user exists on-chain
export const checkUserRegistered = async (address) => {
  try {
    const provider = getProvider();
    const contract = getTokenContract(provider);
    
    const balance = await contract.balanceOf(address);
    return balance.gt(0);
  } catch (error) {
    console.error('Error checking user registration:', error);
    throw error;
  }
};

// Register new user and mint initial tokens
export const mintInitialTokens = async (address) => {
  try {
    // For the mobile app with WalletConnect, we'll need to use a signer connected via WalletConnect
    // This is a simplified version assuming we have a signer
    const provider = getProvider();
    const signer = provider.getSigner(address);
    const contract = getTokenContract(signer);
    
    // Call the mint function (assuming the contract has this)
    const tx = await contract.mint(address);
    await tx.wait();
    
    // Get the minted amount (can be from contract events or a fixed amount)
    const mintAmount = ethers.utils.parseEther('100'); // Example: 100 tokens
    
    return {
      tx,
      tokenAmount: parseFloat(ethers.utils.formatEther(mintAmount))
    };
  } catch (error) {
    console.error('Error minting tokens:', error);
    throw error;
  }
};

// Get token balance
export const getTokenBalance = async (address) => {
  try {
    const provider = getProvider();
    const contract = getTokenContract(provider);
    
    const balance = await contract.balanceOf(address);
    return parseFloat(ethers.utils.formatEther(balance));
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
};

// Burn tokens
export const burnTokens = async (address, amount) => {
  try {
    const provider = getProvider();
    const signer = provider.getSigner(address);
    const contract = getTokenContract(signer);
    
    const parsedAmount = ethers.utils.parseEther(amount.toString());
    const tx = await contract.burn(parsedAmount);
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error('Error burning tokens:', error);
    throw error;
  }
};

// Sell tokens for AVAX
export const sellTokens = async (address, amount) => {
  try {
    const provider = getProvider();
    const signer = provider.getSigner(address);
    const contract = getTokenContract(signer);
    
    const parsedAmount = ethers.utils.parseEther(amount.toString());
    const tx = await contract.sell(parsedAmount);
    const receipt = await tx.wait();
    
    // Parse event to get AVAX received (assuming the contract emits this)
    // This is simplified - actual implementation would need to find the correct event
    const event = receipt.events.find(e => e.event === 'TokensSold');
    const avaxReceived = parseFloat(ethers.utils.formatEther(event.args.avaxAmount));
    
    return avaxReceived;
  } catch (error) {
    console.error('Error selling tokens:', error);
    throw error;
  }
};

// Get current token price
export const getTokenPrice = async () => {
  try {
    const provider = getProvider();
    const contract = getTokenContract(provider);
    
    const price = await contract.getCurrentPrice();
    return parseFloat(ethers.utils.formatEther(price));
  } catch (error) {
    console.error('Error getting token price:', error);
    throw error;
  }
};

// Register user and mint tokens (for mobile app with WalletConnect)
export const registerUser = async (address) => {
  try {
    // This function would be implemented with WalletConnect
    // For now, it's a placeholder that just calls mintInitialTokens
    return await mintInitialTokens(address);
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};
