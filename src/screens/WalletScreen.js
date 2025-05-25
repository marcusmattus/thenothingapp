import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { WalletContext } from '../context/WalletContext';
import WalletConnect from '../components/WalletConnect';
import { checkUserExists } from '../services/firebase';
import theme from '../styles/theme';

const WalletScreen = ({ navigation }) => {
  const { address, connected, connectWallet, disconnectWallet } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const checkUserRegistration = async () => {
      if (connected && address) {
        setLoading(true);
        try {
          const exists = await checkUserExists(address);
          setUserExists(exists);
        } catch (error) {
          console.error('Error checking user status:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkUserRegistration();
  }, [connected, address]);

  const handleContinue = () => {
    if (userExists) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('Signup');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>The Nothing App</Text>
        <Text style={styles.subtitle}>Connect to join the network</Text>

        {!connected ? (
          <WalletConnect onConnect={connectWallet} />
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.loadingText}>Checking wallet status...</Text>
          </View>
        ) : (
          <View style={styles.connectedContainer}>
            <Text style={styles.connectedText}>Connected with:</Text>
            <Text style={styles.address}>{address}</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={handleContinue}
              >
                <Text style={styles.buttonText}>
                  {userExists ? 'Continue to App' : 'Register New Node'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectWallet}
              >
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by Avalanche C-Chain
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: 48,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.textSecondary,
  },
  connectedContainer: {
    alignItems: 'center',
    width: '100%',
  },
  connectedText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: theme.colors.accent,
    marginBottom: 32,
    padding: 12,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectButton: {
    paddingVertical: 12,
  },
  disconnectText: {
    color: theme.colors.error,
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});

export default WalletScreen;
