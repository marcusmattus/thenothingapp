import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WalletContext } from '../context/WalletContext';
import { registerUser, mintInitialTokens } from '../services/blockchain';
import { createUserNode } from '../services/firebase';
import { getNodePosition } from '../utils/nodeGeneration';
import theme from '../styles/theme';

const SignupScreen = ({ navigation }) => {
  const { address, connected } = useContext(WalletContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);
  const [step, setStep] = useState(1); // 1: Intro, 2: Processing, 3: Success

  useEffect(() => {
    if (!connected) {
      navigation.replace('Wallet');
    }
  }, [connected, navigation]);

  const handleSignup = async () => {
    try {
      setIsRegistering(true);
      setStep(2);

      // 1. Register on blockchain and mint tokens
      const { tx, tokenAmount } = await mintInitialTokens(address);
      setTransactionHash(tx.hash);

      // 2. Generate node position based on wallet address
      const nodePosition = getNodePosition(address);

      // 3. Save user node to Firebase
      await createUserNode({
        address,
        position: nodePosition,
        joinedAt: new Date().toISOString(),
        tokensMinted: tokenAmount,
      });

      // 4. Show success
      setStep(3);
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(
        'Registration Failed',
        'There was an error during the registration process. Please try again.'
      );
      setStep(1);
    } finally {
      setIsRegistering(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>Join The Nothing</Text>
            <Text style={styles.description}>
              By joining, you'll create your unique node in the network and receive $NTH tokens.
            </Text>
            <Text style={styles.warning}>
              This requires an on-chain transaction on Avalanche C-Chain.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={isRegistering}
            >
              <Text style={styles.buttonText}>Create My Node</Text>
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.title}>Processing...</Text>
            <Text style={styles.description}>
              Creating your node and minting your initial $NTH tokens.
            </Text>
            <Text style={styles.info}>
              Please confirm the transaction in your wallet and wait for it to be processed.
            </Text>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>Welcome to Nothing!</Text>
            <Text style={styles.description}>
              Your node has been created and your $NTH tokens have been minted.
            </Text>
            {transactionHash && (
              <Text style={styles.transactionHash}>
                Transaction: {transactionHash.substring(0, 10)}...
              </Text>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.replace('Home')}
            >
              <Text style={styles.buttonText}>Enter The Nothing</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderStep()}
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
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  warning: {
    fontSize: 14,
    color: theme.colors.accent,
    marginBottom: 24,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionHash: {
    fontSize: 12,
    color: theme.colors.accent,
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default SignupScreen;
