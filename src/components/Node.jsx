import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getNodeColor } from '../utils/nodeGeneration';
import theme from '../styles/theme';

const Node = ({ node, isUserNode }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate node appearance
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Node size based on importance (user's node is larger)
  const nodeSize = isUserNode ? 16 : 10;
  
  // Node color based on wallet address or user status
  const nodeColor = isUserNode 
    ? theme.colors.accent
    : getNodeColor(node.address);
    
  // Return animated node
  return (
    <Animated.View
      style={[
        styles.nodeContainer,
        {
          left: node.x,
          top: node.y,
          transform: [{ scale }],
          opacity,
        }
      ]}
    >
      <Svg height={nodeSize * 2} width={nodeSize * 2}>
        <Circle
          cx={nodeSize}
          cy={nodeSize}
          r={nodeSize}
          fill={nodeColor}
        />
      </Svg>
      
      {isUserNode && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>You</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    // Center the node on its coordinates
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  labelContainer: {
    position: 'absolute',
    top: 24,
    backgroundColor: theme.colors.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  label: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Node;