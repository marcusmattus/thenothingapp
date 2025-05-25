import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WalletContext } from '../context/WalletContext';
import NodeCanvas from '../components/NodeCanvas';
import TokenActions from '../components/TokenActions';
import { fetchNodeData, subscribeToNodeUpdates } from '../services/firebase';
import theme from '../styles/theme';
import { calculateTokenPrice } from '../utils/tokenomics';
import { getTokenBalance } from '../services/blockchain';

const HomeScreen = ({ navigation }) => {
  const { address, connected } = useContext(WalletContext);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);

  useEffect(() => {
    if (!connected) {
      navigation.navigate('Wallet');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch all nodes
        const nodeData = await fetchNodeData();
        setNodes(nodeData);
        
        // Calculate current token price based on total users
        const currentPrice = calculateTokenPrice(nodeData.length);
        setTokenPrice(currentPrice);

        // Get user's token balance if connected
        if (connected && address) {
          const balance = await getTokenBalance(address);
          setTokenBalance(balance);
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time node updates
    const unsubscribe = subscribeToNodeUpdates((updatedNodes) => {
      setNodes(updatedNodes);
      setTokenPrice(calculateTokenPrice(updatedNodes.length));
    });

    // Update token balance periodically
    const balanceInterval = setInterval(async () => {
      if (connected && address) {
        const balance = await getTokenBalance(address);
        setTokenBalance(balance);
      }
    }, 15000); // Every 15 seconds

    return () => {
      unsubscribe();
      clearInterval(balanceInterval);
    };
  }, [connected, address, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Connecting to Nothing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>The Nothing App</Text>
        <TouchableOpacity 
          style={styles.walletButton}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={styles.walletButtonText}>
            {connected ? address.substring(0, 6) + '...' + address.substring(address.length - 4) : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Nodes</Text>
          <Text style={styles.statValue}>{nodes.length}</Text>
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

      <NodeCanvas nodes={nodes} currentAddress={address} />
      
      <TokenActions 
        tokenBalance={tokenBalance} 
        tokenPrice={tokenPrice}
        onBalanceChange={setTokenBalance}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.text,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 24,
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
});

export default HomeScreen;
