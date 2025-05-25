import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { generateMockNodes, calculateDistance } from '../utils/nodeGeneration';
import theme from '../styles/theme';

const { width, height } = Dimensions.get('window');

const NetworkVisualization = ({ userAddress }) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    // Generate nodes for visualization
    const networkNodes = generateMockNodes(10);
    
    // Add user's node if address is provided
    if (userAddress) {
      // Add user's node at the center
      networkNodes.push({
        address: userAddress,
        x: width / 2,
        y: height / 2,
        timestamp: Date.now(),
        isUser: true
      });
    }
    
    setNodes(networkNodes);
    
    // Generate connections between nodes
    const nodeConnections = [];
    for (let i = 0; i < networkNodes.length; i++) {
      for (let j = i + 1; j < networkNodes.length; j++) {
        const distance = calculateDistance(
          [networkNodes[i].x, networkNodes[i].y],
          [networkNodes[j].x, networkNodes[j].y]
        );
        
        // Only connect nodes that are within a reasonable distance
        if (distance < 150) {
          nodeConnections.push({
            id: `${i}-${j}`,
            from: networkNodes[i],
            to: networkNodes[j],
            strength: 1 - (distance / 150) // Stronger connections for closer nodes
          });
        }
      }
    }
    setConnections(nodeConnections);
  }, [userAddress]);

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%">
        {/* Draw connections first (they'll be under the nodes) */}
        {connections.map(conn => (
          <Line
            key={conn.id}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke={theme.colors.connection}
            strokeWidth={1}
            opacity={conn.strength * 0.7}
          />
        ))}
        
        {/* Draw all nodes */}
        {nodes.map((node, index) => {
          const isUserNode = node.isUser || node.address === userAddress;
          const nodeSize = isUserNode ? 16 : 10;
          const nodeColor = isUserNode ? theme.colors.accent : 
            `hsl(${(parseInt(node.address.substr(2, 6), 16) % 360)}, 70%, 60%)`;
          
          return (
            <Circle
              key={node.address}
              cx={node.x}
              cy={node.y}
              r={nodeSize}
              fill={nodeColor}
            />
          );
        })}
      </Svg>
      
      <View style={styles.infoOverlay}>
        <Text style={styles.nodeCount}>Nodes: {nodes.length}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvasBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 8,
  },
  nodeCount: {
    color: theme.colors.text,
    fontSize: 12,
  }
});

export default NetworkVisualization;