import React, { createContext, useState, useEffect } from 'react';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import { AVALANCHE_RPC_URL } from '../constants';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);

  // Initialize WalletConnect
  const connector = {
    storage: AsyncStorage,
    qrcodeModalOptions: {
      mobileLinks: ['metamask', 'trust', 'rainbow'],
    },
    rpc: {
      43114: AVALANCHE_RPC_URL, // Avalanche C-Chain
    },
    chainId: 43114,
  };

  // Connect wallet using WalletConnect
  const connectWallet = async () => {
    try {
      setError(null);
      
      // Create WalletConnect provider
      const wcProvider = new WalletConnectProvider(connector);
      
      // Enable session (triggers QR Code modal)
      await wcProvider.enable();
      
      // Get signer
      const web3Provider = new ethers.providers.Web3Provider(wcProvider);
      const signer = web3Provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // Save connection info
      setConnected(true);
      setAddress(userAddress);
      setProvider(web3Provider);
      
      return { address: userAddress, provider: web3Provider, signer };
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      throw err;
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      if (provider && provider.disconnect) {
        await provider.disconnect();
      }
      
      setConnected(false);
      setAddress(null);
      setProvider(null);
    } catch (err) {
      console.error('Wallet disconnection error:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
  };

  // Check for existing connection on app start
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // WalletConnect has auto-reconnect functionality
        // If a session exists, it will be restored
        // This is handled by the WalletConnectProvider
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkConnection();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        provider,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      <WalletConnectProvider connector={connector}>
        {children}
      </WalletConnectProvider>
    </WalletContext.Provider>
  );
};
