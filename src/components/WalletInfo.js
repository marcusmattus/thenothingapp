import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../utils/colors';

const WalletInfo = ({ walletAddress }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.addressContainer}>
        <Text style={styles.label}>Connected Wallet</Text>
        <View style={styles.addressRow}>
          <Text style={styles.addressText}>{truncateAddress(walletAddress)}</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
            {copied ? (
              <Feather name="check" size={16} color={colors.success} />
            ) : (
              <Feather name="copy" size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.exploreButton}>
        <Text style={styles.exploreText}>View on Explorer</Text>
        <Feather name="external-link" size={14} color={colors.accent} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackgroundLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  exploreText: {
    fontSize: 12,
    color: colors.accent,
    marginRight: 4,
  },
});

export default WalletInfo;
