import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { connectWallet } from '../services/wallet';
import { setWalletAddress } from '../redux/slices/authSlice';
import { colors } from '../utils/colors';

const WelcomeScreen = ({ navigation }) => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      const address = await connectWallet();
      
      if (address) {
        dispatch(setWalletAddress(address));
        navigation.navigate('Main');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Error connecting wallet: ' + err.message);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Svg height="120" width="120" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="40" fill="none" stroke={colors.accent} strokeWidth="2" />
          <Path 
            d="M30,50 L70,50 M50,30 L50,70" 
            stroke={colors.accent} 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
        </Svg>
        <Text style={styles.title}>The Nothing App</Text>
        <Text style={styles.subtitle}>Start from nothing, build something together</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.description}>
          Connect your wallet to join the network, mint your $NTH token, and become a node in our decentralized visualization.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <ConnectWalletButton onPress={handleConnect} isLoading={connecting} />

        <TouchableOpacity 
          style={styles.learnMoreButton}
          onPress={() => navigation.navigate('About')}
        >
          <Text style={styles.learnMoreText}>Learn more about $NTH</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  learnMoreButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  learnMoreText: {
    color: colors.accent,
    fontSize: 14,
  },
});

export default WelcomeScreen;
