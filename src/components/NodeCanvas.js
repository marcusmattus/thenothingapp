import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Modal, Text, TouchableOpacity } from 'react-native';
import Node from './Node';
import Svg, { Line } from 'react-native-svg';
import theme from '../styles/theme';

const { width, height } = Dimensions.get('window');
const CANVAS_HEIGHT = height * 0.5;

const NodeCanvas = ({ nodes, currentAddress }) => {
  const [canvasSize, setCanvasSize] = useState({ width: width - 32, height: CANVAS_HEIGHT });
  const [selectedNode, setSelectedNode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Calculate connections between nodes
  const calculateConnections = () => {
    const connections = [];
    const MAX_DISTANCE = 100; // Maximum distance for a connection
    
    // Only create connections between nearby nodes to avoid a messy web
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(nodes[i].position[0] - nodes[j].position[0], 2) +
          Math.pow(nodes[i].position[1] - nodes[j].position[1], 2)
        );
        
        if (distance < MAX_DISTANCE) {
          connections.push({
            from: nodes[i].position,
            to: nodes[j].position,
            opacity: 1 - distance / MAX_DISTANCE, // Fade lines with distance
          });
        }
      }
    }
    
    return connections;
  };

  const handleNodePress = (node) => {
    setSelectedNode(node);
    setModalVisible(true);
  };

  const connections = calculateConnections();
  
  // Format date from ISO string
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <View 
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setCanvasSize({ width, height });
      }}
    >
      <Svg width={canvasSize.width} height={canvasSize.height}>
        {connections.map((connection, index) => (
          <Line
            key={`connection-${index}`}
            x1={connection.from[0]}
            y1={connection.from[1]}
            x2={connection.to[0]}
            y2={connection.to[1]}
            stroke={theme.colors.connection}
            strokeWidth={1}
            opacity={connection.opacity * 0.5}
          />
        ))}
      </Svg>

      {nodes.map((node) => (
        <Node
          key={node.address}
          node={node}
          isCurrentUser={node.address === currentAddress}
          onPress={handleNodePress}
        />
      ))}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            {selectedNode && (
              <>
                <Text style={styles.modalTitle}>Node Details</Text>
                <Text style={styles.addressLabel}>Address:</Text>
                <Text style={styles.addressText}>{selectedNode.address}</Text>
                <Text style={styles.detailLabel}>Joined:</Text>
                <Text style={styles.detailText}>{formatDate(selectedNode.joinedAt)}</Text>
                <Text style={styles.detailLabel}>Initial Tokens:</Text>
                <Text style={styles.detailText}>{selectedNode.tokensMinted} $NTH</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvasBackground,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'flex-start',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.accent,
    marginBottom: 16,
    width: '100%',
    padding: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 12,
  },
});

export default NodeCanvas;
