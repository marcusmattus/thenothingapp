import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../utils/colors';

const { width, height } = Dimensions.get('window');

const NodeVisualizer = ({ node, isUserNode, isConnected }) => {
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
  
  // Node color based on state
  const nodeColor = isUserNode 
    ? colors.accent
    : isConnected 
      ? colors.secondary
      : colors.inactive;

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
});

export default NodeVisualizer;
