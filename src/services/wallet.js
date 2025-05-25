import { ethers } from 'ethers';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { AVALANCHE_RPC_URL, AVALANCHE_CHAIN_ID, NOTHING_TOKEN_ADDRESS } from '../constants';
import NothingTokenABI from '../constants/NothingTokenABI.json';
import NothingAppABI from '../constants/NothingAppABI.json';

let connector = null;

/**
 * Initialize WalletConnect
 * @returns {Object} WalletConnect connector
 */
export const initWalletConnect = () => {
  if (!connector) {
    connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: QRCodeModal,
    });
  }
  return connector;
};

/**
 * Connect to wallet using WalletConnect
 * @returns {Promise<string>} Connected wallet address
 */
export const connectWallet = async () => {
  try {
    const walletConnector = initWalletConnect();
    
    // If not connected, create a new session
    if (!walletConnector.connected) {
      await walletConnector.createSession({
        chainId: AVALANCHE_CHAIN_ID,
      });
      
      // Show QR Code modal
      // Wait for connection
      return new Promise((resolve, reject) => {
        // Subscribe to connection events
        walletConnector.on('connect', (error, payload) => {
          if (error) {
            reject(error);
            return;
          }
          
          const { accounts } = payload.params[0];
          if (accounts && accounts.length > 0) {
            resolve(accounts[0]);
          } else {
            reject(new Error('No accounts found'));
          }
        });
        
        walletConnector.on('disconnect', (error) => {
          reject(error || new Error('Wallet disconnected'));
        });
      });
    } else {
      // Already connected, return the first account
      const { accounts } = walletConnector;
      if (accounts && accounts.length > 0) {
        return accounts[0];
      } else {
        throw new Error('No accounts found');
      }
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

/**
 * Disconnect wallet
 * @returns {Promise<void>}
 */
export const disconnectWallet = async () => {
  try {
    const walletConnector = initWalletConnect();
    if (walletConnector.connected) {
      await walletConnector.killSession();
    }
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    throw error;
  }
};

/**
 * Get provider for Avalanche C-Chain
 * @returns {ethers.providers.Web3Provider} Ethers provider
 */
export const getProvider = () => {
  try {
    if (window.ethereum) {
      // Use injected provider if available (e.g., MetaMask)
      return new ethers.providers.Web3Provider(window.ethereum);
    } else if (connector && connector.connected) {
      // Use WalletConnect provider
      return new ethers.providers.Web3Provider(connector);
    } else {
      // Fallback to RPC provider
      return new ethers.providers.JsonRpcProvider(AVALANCHE_RPC_URL);
    }
  } catch (error) {
    console.error('Error getting provider:', error);
    // Fallback to RPC provider
    return new ethers.providers.JsonRpcProvider(AVALANCHE_RPC_URL);
  }
};

/**
 * Get signer for connected wallet
 * @returns {ethers.Signer} Ethers signer
 */
export const getSigner = async () => {
  try {
    const provider = getProvider();
    
    if (window.ethereum) {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    
    return provider.getSigner();
  } catch (error) {
    console.error('Error getting signer:', error);
    throw error;
  }
};

/**
 * Get Nothing Token contract instance
 * @returns {ethers.Contract} Nothing Token contract
 */
export const getNothingTokenContract = async () => {
  try {
    const signer = await getSigner();
    return new ethers.Contract(NOTHING_TOKEN_ADDRESS, NothingTokenABI, signer);
  } catch (error) {
    console.error('Error getting Nothing Token contract:', error);
    throw error;
  }
};

/**
 * Get Nothing App contract instance
 * @returns {ethers.Contract} Nothing App contract
 */
export const getNothingAppContract = async () => {
  try {
    const signer = await getSigner();
    // Fetch the app contract address from the token contract
    const tokenContract = await getNothingTokenContract();
    const appAddress = await tokenContract.nothingApp();
    
    return new ethers.Contract(appAddress, NothingAppABI, signer);
  } catch (error) {
    console.error('Error getting Nothing App contract:', error);
    throw error;
  }
};