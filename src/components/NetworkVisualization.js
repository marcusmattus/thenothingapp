import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Node from './Node';
import { generateMockNodes } from '../utils/nodeGeneration';

const NetworkVisualization = ({ userAddress }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Generate deterministic node position for the current user
  const getCurrentUserNode = () => {
    if (!userAddress) return null;
    
    // Using a hash algorithm to generate a position based on address
    const addressBytes = userAddress.split('').map(char => char.charCodeAt(0));
    const xSeed = addressBytes.reduce((sum, byte, i) => sum + byte * (i + 1), 0) % 1000;
    const ySeed = addressBytes.reduce((sum, byte, i) => sum + byte * (i + 2), 0) % 1000;
    
    // Normalize to canvas size (will be updated once canvas is measured)
    const x = (xSeed / 1000) * 0.5 + 0.25;
    const y = (ySeed / 1000) * 0.5 + 0.25;
    
    return {
      id: userAddress,
      address: userAddress,
      x,
      y,
      isCurrentUser: true,
      size: 15,
      pulseIntensity: 1.5,
      color: '#8A2BE2'
    };
  };

  // Initialize nodes
  useEffect(() => {
    // Create mock nodes for demonstration
    // In a real app, this would fetch from the blockchain or backend
    const mockNodes = generateMockNodes(15);
    
    // Add current user node
    const userNode = getCurrentUserNode();
    
    setNodes(userNode ? [...mockNodes, userNode] : mockNodes);
    setIsLoading(false);
  }, [userAddress]);

  // Calculate canvas size on mount and resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
        
        // Update node positions with actual canvas size
        setNodes(prev => 
          prev.map(node => ({
            ...node,
            actualX: node.x * width,
            actualY: node.y * height
          }))
        );
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Calculate connections between nodes based on proximity
  useEffect(() => {
    if (nodes.length > 0 && canvasSize.width > 0) {
      const newConnections = [];
      const NODE_CONNECTION_DISTANCE = 150; // Maximum distance to draw connections
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          
          if (nodeA.actualX && nodeB.actualX) {
            const distance = Math.sqrt(
              Math.pow(nodeA.actualX - nodeB.actualX, 2) + 
              Math.pow(nodeA.actualY - nodeB.actualY, 2)
            );
            
            if (distance < NODE_CONNECTION_DISTANCE) {
              const opacity = 1 - (distance / NODE_CONNECTION_DISTANCE); // Fade out with distance
              newConnections.push({
                id: `${nodeA.id}-${nodeB.id}`,
                source: nodeA.id,
                target: nodeB.id,
                sourceX: nodeA.actualX,
                sourceY: nodeA.actualY,
                targetX: nodeB.actualX,
                targetY: nodeB.actualY,
                opacity
              });
            }
          }
        }
      }
      
      setConnections(newConnections);
    }
  }, [nodes, canvasSize]);

  if (isLoading) {
    return <LoadingContainer>Loading network visualization...</LoadingContainer>;
  }

  return (
    <Container>
      <Title>Network Visualization</Title>
      <Description>
        Visualizing the network of users on The Nothing App. Each node represents a user,
        with connections indicating proximity in the network.
      </Description>
      
      <Canvas ref={canvasRef}>
        {/* Draw connections first (so they appear below nodes) */}
        {connections.map(connection => (
          <Connection 
            key={connection.id}
            x1={connection.sourceX}
            y1={connection.sourceY}
            x2={connection.targetX}
            y2={connection.targetY}
            opacity={connection.opacity}
          />
        ))}
        
        {/* Draw nodes */}
        {nodes.map(node => (
          <Node
            key={node.id}
            x={node.actualX}
            y={node.actualY}
            size={node.size || 10}
            color={node.color || '#404052'}
            pulseIntensity={node.isCurrentUser ? 1.5 : (node.pulseIntensity || 1)}
            isCurrentUser={node.isCurrentUser}
          />
        ))}
      </Canvas>
      
      <Legend>
        <LegendItem>
          <LegendColor color="#8A2BE2" />
          <LegendText>Your Node</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#404052" />
          <LegendText>Other Users</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendLine />
          <LegendText>Connection</LegendText>
        </LegendItem>
      </Legend>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.space.lg};
  height: 100%;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.space.lg};
  font-size: 0.9rem;
  line-height: 1.6;
`;

const Canvas = styled.div`
  position: relative;
  flex: 1;
  background-color: ${({ theme }) => theme.colors.canvasBackground};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  min-height: 400px;
`;

const Connection = styled.div`
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.connection};
  opacity: ${props => props.opacity || 0.3};
  transform-origin: 0 0;
  transform: ${props => {
    const dx = props.x2 - props.x1;
    const dy = props.y2 - props.y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return `translate(${props.x1}px, ${props.y1}px) rotate(${angle}deg) scaleX(${length})`;
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Legend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.lg};
  margin-top: ${({ theme }) => theme.space.lg};
  padding-top: ${({ theme }) => theme.space.md};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: ${({ theme }) => theme.space.sm};
`;

const LegendLine = styled.div`
  width: 20px;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.connection};
  margin-right: ${({ theme }) => theme.space.sm};
`;

const LegendText = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default NetworkVisualization;