import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import theme from '../styles/theme';

const WalletConnect = ({ onConnect }) => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      await onConnect();
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.walletButton}
        onPress={handleConnect}
        disabled={connecting}
      >
        {connecting ? (
          <ActivityIndicator size="small" color={theme.colors.buttonText} />
        ) : (
          <>
            <View style={styles.walletIconContainer}>
              <Text style={styles.walletIcon}>🔗</Text>
            </View>
            <Text style={styles.walletButtonText}>Connect with WalletConnect</Text>
          </>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Text style={styles.infoText}>
        Connect your Avalanche C-Chain wallet to create your node and join the network.
      </Text>
      
      <View style={styles.supportedWalletsContainer}>
        <Text style={styles.supportedWalletsText}>Supported wallets:</Text>
        <View style={styles.walletsList}>
          <Text style={styles.walletName}>MetaMask</Text>
          <Text style={styles.walletSeparator}>•</Text>
          <Text style={styles.walletName}>Coinbase Wallet</Text>
          <Text style={styles.walletSeparator}>•</Text>
          <Text style={styles.walletName}>Trust Wallet</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '80%',
    marginBottom: 16,
  },
  walletIconContainer: {
    marginRight: 12,
  },
  walletIcon: {
    fontSize: 18,
  },
  walletButtonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  supportedWalletsContainer: {
    alignItems: 'center',
  },
  supportedWalletsText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  walletsList: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  walletName: {
    color: theme.colors.text,
    fontSize: 12,
  },
  walletSeparator: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginHorizontal: 8,
  },
});

export default WalletConnect;
