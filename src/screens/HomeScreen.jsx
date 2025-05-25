import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import NetworkVisualization from '../components/NetworkVisualization';
import theme from '../styles/theme';

const HomeScreen = ({ navigation }) => {
  const [userAddress, setUserAddress] = useState('0x123456789abcdef0123456789abcdef01234567');
  const [tokenBalance, setTokenBalance] = useState(100);
  const [tokenPrice, setTokenPrice] = useState(0.01);
  const [nodeCount, setNodeCount] = useState(10);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>The Nothing App</Text>
        <TouchableOpacity 
          style={styles.walletButton}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={styles.walletButtonText}>
            {userAddress ? `${userAddress.substring(0, 6)}...` : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Nodes</Text>
          <Text style={styles.statValue}>{nodeCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>$NTH Balance</Text>
          <Text style={styles.statValue}>{tokenBalance.toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>$NTH Price</Text>
          <Text style={styles.statValue}>{tokenPrice.toFixed(4)} AVAX</Text>
        </View>
      </View>

      <View style={styles.visualizationContainer}>
        <NetworkVisualization userAddress={userAddress} />
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => console.log('Burn tokens')}
        >
          <Text style={styles.actionButtonText}>Burn Tokens</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => console.log('Sell tokens')}
        >
          <Text style={styles.actionButtonText}>Sell Tokens</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  walletButton: {
    backgroundColor: theme.colors.accentDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  walletButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  visualizationContainer: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  actionButtonText: {
    color: theme.colors.buttonText,
    fontWeight: 'bold',
  },
});

export default HomeScreen;