import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Node = ({ x, y, size = 10, color = '#404052', pulseIntensity = 1, isCurrentUser = false }) => {
  // Animations for the pulsing effect
  const pulseVariants = {
    pulse: {
      scale: [1, pulseIntensity, 1],
      opacity: [0.8, 0.2, 0.8],
      transition: {
        duration: isCurrentUser ? 1.5 : 2 + Math.random() * 2, // Randomize slightly for non-user nodes
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  // Glow effect variants (only for current user)
  const glowVariants = {
    pulse: {
      boxShadow: [
        `0 0 5px rgba(138, 43, 226, 0.5)`,
        `0 0 20px rgba(138, 43, 226, 0.8)`,
        `0 0 5px rgba(138, 43, 226, 0.5)`
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <NodeContainer style={{ left: x, top: y }}>
      {/* Pulse ring (only for current user) */}
      {isCurrentUser && (
        <PulseRing
          as={motion.div}
          animate="pulse"
          variants={pulseVariants}
          size={size * 3}
          color={color}
        />
      )}
      
      {/* Node circle */}
      <NodeCircle
        as={motion.div}
        animate="pulse"
        variants={isCurrentUser ? glowVariants : {}}
        size={size}
        color={color}
        isCurrentUser={isCurrentUser}
      />
    </NodeContainer>
  );
};

// Styled components
const NodeContainer = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
`;

const NodeCircle = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background-color: ${props => props.color};
  box-shadow: ${props => 
    props.isCurrentUser 
      ? `0 0 10px rgba(138, 43, 226, 0.7)` 
      : 'none'
  };
  z-index: 2;
`;

const PulseRing = styled.div`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  border: 1px solid ${props => props.color};
  z-index: 1;
`;

export default Node;