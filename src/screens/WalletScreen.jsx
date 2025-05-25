import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import theme from '../styles/theme';

const WalletScreen = ({ navigation }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockAddress = '0x123456789abcdef0123456789abcdef01234567';
      
      setAddress(mockAddress);
      setIsConnected(true);
      setIsConnecting(false);
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Wallet</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Svg height={120} width={120} viewBox="0 0 100 100">
            <Circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke={theme.colors.accent} 
              strokeWidth="2" 
            />
            <Path 
              d="M30,50 L70,50 M50,30 L50,70" 
              stroke={theme.colors.accent} 
              strokeWidth="2" 
              strokeLinecap="round" 
            />
          </Svg>
        </View>

        <Text style={styles.subtitle}>
          {isConnected 
            ? "Your wallet is connected to The Nothing App" 
            : "Connect your wallet to participate in the network"}
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isConnected ? (
          <View style={styles.walletInfo}>
            <Text style={styles.walletInfoLabel}>Connected Wallet:</Text>
            <Text style={styles.walletAddress}>
              {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </Text>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.disconnectButton}
                onPress={disconnectWallet}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.enterButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.enterButtonText}>Enter App</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color={theme.colors.buttonText} />
            ) : (
              <Text style={styles.connectButtonText}>Connect Wallet</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: theme.colors.accent,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
  walletInfo: {
    width: '100%',
    alignItems: 'center',
  },
  walletInfoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  connectButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  connectButtonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: theme.colors.buttonText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  enterButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  enterButtonText: {
    color: theme.colors.buttonText,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default WalletScreen;