import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Node from './Node';
import { calculateDistance } from '../utils/nodeGeneration';
import theme from '../styles/theme';

const { width, height } = Dimensions.get('window');

const NodeCanvas = ({ nodes = [], currentAddress }) => {
  // Filter out connections to display
  // We'll only show connections between nodes that are "close" to each other
  const connections = [];
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = calculateDistance(
        [nodes[i].x, nodes[i].y], 
        [nodes[j].x, nodes[j].y]
      );
      
      // Only connect nodes that are within a certain distance
      if (distance < 150) {
        connections.push({
          id: `${nodes[i].address}-${nodes[j].address}`,
          from: [nodes[i].x, nodes[i].y],
          to: [nodes[j].x, nodes[j].y],
          strength: 1 - (distance / 150), // Stronger connections for closer nodes
        });
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Draw connections between nodes */}
      {connections.map(connection => (
        <View 
          key={connection.id}
          style={[
            styles.connection,
            {
              left: connection.from[0],
              top: connection.from[1],
              width: calculateDistance(connection.from, connection.to),
              transform: [
                { 
                  rotate: `${Math.atan2(
                    connection.to[1] - connection.from[1],
                    connection.to[0] - connection.from[0]
                  )}rad` 
                },
                { translateX: 0 },
                { translateY: 0 },
              ],
              opacity: connection.strength * 0.5,
            }
          ]}
        />
      ))}
      
      {/* Draw nodes */}
      {nodes.map(node => (
        <Node 
          key={node.address}
          node={node}
          isUserNode={node.address.toLowerCase() === currentAddress?.toLowerCase()}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  connection: {
    position: 'absolute',
    height: 1,
    backgroundColor: theme.colors.connection,
    transformOrigin: 'left',
  },
});

export default NodeCanvas;