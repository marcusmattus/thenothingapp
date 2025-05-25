import React from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

// App constants
const APP_NAME = 'The Nothing App';

// Theme colors
const theme = {
  colors: {
    background: '#15151F',         // Dark blue/black
    cardBackground: '#1E1E2A',     // Slightly lighter background for cards
    canvasBackground: '#12121A',   // Darker background for node canvas
    text: '#FFFFFF',               // White text
    textSecondary: '#9B9BAD',      // Light gray for secondary text
    accent: '#8A2BE2',             // Vibrant purple
    accentDark: '#5D1D9A',         // Darker purple
    error: '#E25C5C',              // Red for errors
    success: '#4CAF50',            // Green for success
    warning: '#FFC107',            // Yellow for warnings
    buttonText: '#FFFFFF',         // White text on buttons
    connection: '#404052',         // Color for node connections
  }
};

// Mock node data for visualization
const mockNodes = [
  { id: 1, address: '0x123...456', x: 100, y: 100, color: '#8A2BE2' },
  { id: 2, address: '0x789...012', x: 200, y: 150, color: '#4169E1' },
  { id: 3, address: '0x345...678', x: 150, y: 250, color: '#9932CC' },
  { id: 4, address: '0x901...234', x: 300, y: 200, color: '#6A5ACD' },
  { id: 5, address: '0x567...890', x: 250, y: 100, color: '#483D8B' },
];

// User node (highlighted)
const userNode = { id: 0, address: '0xYou...', x: 180, y: 180, color: theme.colors.accent };

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{APP_NAME}</Text>
        <TouchableOpacity style={styles.walletButton}>
          <Text style={styles.walletButtonText}>0xYou...</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Nodes</Text>
          <Text style={styles.statValue}>{mockNodes.length + 1}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>$NTH Balance</Text>
          <Text style={styles.statValue}>100.00</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>$NTH Price</Text>
          <Text style={styles.statValue}>0.0120 AVAX</Text>
        </View>
      </View>
      
      <View style={styles.canvasContainer}>
        <Svg width="100%" height="100%">
          {/* Draw connections between nodes */}
          {mockNodes.map(node => (
            <Line
              key={`connection-${node.id}`}
              x1={userNode.x}
              y1={userNode.y}
              x2={node.x}
              y2={node.y}
              stroke={theme.colors.connection}
              strokeWidth={1}
              opacity={0.5}
            />
          ))}
          
          {/* Draw all other nodes */}
          {mockNodes.map(node => (
            <Circle
              key={`node-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={10}
              fill={node.color}
            />
          ))}
          
          {/* Draw user node (highlighted) */}
          <Circle
            cx={userNode.x}
            cy={userNode.y}
            r={16}
            fill={userNode.color}
          />
        </Svg>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Burn Tokens</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Sell Tokens</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Start from nothing, build something together
        </Text>
      </View>
    </View>
  );
}

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
    marginTop: 40,
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
  footer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
