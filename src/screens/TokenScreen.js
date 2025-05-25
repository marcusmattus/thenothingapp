import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import TokenActions from '../components/TokenActions';
import { colors } from '../utils/colors';
import { fetchTokenHistory, fetchTokenInfo } from '../redux/slices/tokenSlice';

const TokenScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const { walletAddress } = useSelector(state => state.auth);
  const { balance, tokenPrice, priceHistory } = useSelector(state => state.token);

  useEffect(() => {
    const loadTokenData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await Promise.all([
          dispatch(fetchTokenInfo(walletAddress)),
          dispatch(fetchTokenHistory())
        ]);
      } catch (err) {
        console.error('Error loading token data:', err);
        setError('Failed to load token data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTokenData();
  }, [dispatch, walletAddress]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>$NTH Token</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading token information...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              dispatch(fetchTokenInfo(walletAddress));
              dispatch(fetchTokenHistory());
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceValue}>{balance?.toFixed(4)} NTH</Text>
            <Text style={styles.balanceInFiat}>
              ≈ {(balance * tokenPrice).toFixed(6)} AVAX
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Price</Text>
              <Text style={styles.infoValue}>{tokenPrice?.toFixed(6)} AVAX</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price Impact</Text>
              <Text style={styles.infoValue}>+2% per mint</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contract</Text>
              <TouchableOpacity>
                <Text style={styles.addressText}>
                  {`${walletAddress?.substring(0, 6)}...${walletAddress?.substring(walletAddress.length - 4)}`}
                  <Feather name="external-link" size={12} color={colors.accent} />
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TokenActions 
            balance={balance} 
            tokenPrice={tokenPrice} 
            walletAddress={walletAddress} 
          />

          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>About $NTH Token</Text>
            <Text style={styles.descriptionText}>
              $NTH is a social token minted upon joining The Nothing App. Each new user increases the token price by 2%, creating a bonding curve economy. 
            </Text>
            <Text style={styles.descriptionText}>
              Users can burn tokens to reduce supply (slightly decreasing price) or sell tokens for AVAX (more significantly decreasing price).
            </Text>
          </View>
        </ScrollView>
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
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 34, // Same as backButton width
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
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  balanceInFiat: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  addressText: {
    fontSize: 14,
    color: colors.accent,
  },
  descriptionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 10,
  },
});

export default TokenScreen;
