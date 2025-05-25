import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import theme from '../styles/theme';

const HomeScreen = ({ navigation }) => {
  // Sample node data (in a real app this would come from the blockchain)
  const nodes = [
    { id: 1, x: 100, y: 100, address: '0x123...456' },
    { id: 2, x: 200, y: 150, address: '0x789...012' },
    { id: 3, x: 150, y: 250, address: '0x345...678' },
  ];
  
  const tokenBalance = 100;
  const tokenPrice = 0.05;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>The Nothing App</Text>
        <TouchableOpacity 
          style={styles.walletButton}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={styles.walletButtonText}>
            0x1234...5678
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
      
      <View style={styles.canvasContainer}>
        <View style={styles.canvas}>
          {nodes.map((node) => (
            <View 
              key={node.id} 
              style={[styles.node, { left: node.x, top: node.y }]}
            >
              <Svg height={20} width={20}>
                <Circle
                  cx={10}
                  cy={10}
                  r={10}
                  fill={theme.colors.accent}
                />
              </Svg>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Burn Tokens</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
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
    marginBottom: 20,
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
    marginBottom: 20,
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
  canvasContainer: {
    flex: 1,
    backgroundColor: theme.colors.canvasBackground,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
  node: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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