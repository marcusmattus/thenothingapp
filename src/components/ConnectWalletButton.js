import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View 
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../utils/colors';

const ConnectWalletButton = ({ onPress, isLoading, style }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, isLoading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <View style={styles.buttonContent}>
          <Feather name="link" size={20} color={colors.white} style={styles.icon} />
          <Text style={styles.buttonText}>Connect Wallet</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: colors.accent + '80',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 10,
  },
});

export default ConnectWalletButton;
