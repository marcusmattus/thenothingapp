import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connector, setConnector] = useState(null);
  const [error, setError] = useState(null);

  // Initialize wallet connect
  useEffect(() => {
    const initWalletConnect = () => {
      const walletConnector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
        qrcodeModal: QRCodeModal,
      });

      // Check if connection is already established
      if (walletConnector.connected) {
        const { accounts } = walletConnector;
        if (accounts && accounts.length > 0) {
          setCurrentUser({
            address: accounts[0],
            isRegistered: true, // In a real app, check if user is registered
          });
        }
      }

      setConnector(walletConnector);
      setLoading(false);
    };

    initWalletConnect();

    return () => {
      // Clean up connection if needed
      if (connector && connector.connected) {
        // Nothing to do here for now
      }
    };
  }, []);

  // Connect wallet with WalletConnect
  const connectWallet = async () => {
    try {
      setError(null);
      
      if (!connector) {
        throw new Error('WalletConnect not initialized');
      }
      
      // If not connected, create a new session
      if (!connector.connected) {
        await connector.createSession();
        
        // Return a promise that resolves when the user approves the connection
        return new Promise((resolve, reject) => {
          // Subscribe to connection events
          connector.on('connect', (error, payload) => {
            if (error) {
              reject(error);
              return;
            }
            
            const { accounts } = payload.params[0];
            if (accounts && accounts.length > 0) {
              setCurrentUser({
                address: accounts[0],
                isRegistered: true, // In a real app, check if user is registered
              });
              resolve(accounts[0]);
            } else {
              reject(new Error('No accounts found'));
            }
          });
          
          connector.on('disconnect', (error) => {
            setCurrentUser(null);
            reject(error || new Error('Wallet disconnected'));
          });
        });
      } else {
        // Already connected, return the first account
        const { accounts } = connector;
        if (accounts && accounts.length > 0) {
          setCurrentUser({
            address: accounts[0],
            isRegistered: true, // In a real app, check if user is registered
          });
          return accounts[0];
        } else {
          throw new Error('No accounts found');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
      throw err;
    }
  };

  // Sign up with email/password (simulated for now)
  const signUp = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Simulate account creation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would call an API or blockchain method
      setCurrentUser({
        email,
        address: `0x${Math.random().toString(16).substring(2, 12)}...${Math.random().toString(16).substring(2, 6)}`,
        isRegistered: true,
      });
      
      setLoading(false);
      return currentUser;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to create account');
      throw err;
    }
  };

  // Sign in with email/password (simulated for now)
  const signIn = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would verify credentials
      setCurrentUser({
        email,
        address: `0x${Math.random().toString(16).substring(2, 12)}...${Math.random().toString(16).substring(2, 6)}`,
        isRegistered: true,
      });
      
      setLoading(false);
      return currentUser;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      
      if (connector && connector.connected) {
        await connector.killSession();
      }
      
      setCurrentUser(null);
    } catch (err) {
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    connectWallet,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};