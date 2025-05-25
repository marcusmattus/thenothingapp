import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import NetworkVisualization from '../components/NetworkVisualization';
import WalletInfo from '../components/WalletInfo';
import { colors } from '../utils/colors';
import { fetchNetworkNodes } from '../redux/slices/networkSlice';
import { fetchTokenInfo } from '../redux/slices/tokenSlice';
import { subscribeToNodeUpdates, unsubscribeFromNodeUpdates } from '../services/firebase';

const MainScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const { walletAddress } = useSelector(state => state.auth);
  const { nodes } = useSelector(state => state.network);
  const { balance, tokenPrice } = useSelector(state => state.token);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch network nodes and token info in parallel
        await Promise.all([
          dispatch(fetchNetworkNodes()),
          dispatch(fetchTokenInfo(walletAddress))
        ]);
        
        // Subscribe to real-time node updates
        subscribeToNodeUpdates();
      } catch (err) {
        console.error('Error loading network data:', err);
        setError('Failed to load network data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Cleanup subscription when component unmounts
    return () => {
      unsubscribeFromNodeUpdates();
    };
  }, [dispatch, walletAddress]);

  const handleRefresh = () => {
    dispatch(fetchNetworkNodes());
    dispatch(fetchTokenInfo(walletAddress));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>The Nothing Network</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Token')} style={styles.tokenButton}>
          <Text style={styles.tokenButtonText}>${balance?.toFixed(2)} NTH</Text>
          <Feather name="arrow-right" size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading network visualization...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.networkContainer}>
            <NetworkVisualization nodes={nodes} userAddress={walletAddress} />
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Network Nodes</Text>
              <Text style={styles.statValue}>{nodes.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>$NTH Price</Text>
              <Text style={styles.statValue}>{tokenPrice ? `${tokenPrice.toFixed(6)} AVAX` : 'N/A'}</Text>
            </View>
          </View>
          
          <WalletInfo walletAddress={walletAddress} />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  tokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tokenButtonText: {
    color: colors.accent,
    marginRight: 5,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  networkContainer: {
    flex: 1,
    position: 'relative',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.cardBackground,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});

export default MainScreen;
