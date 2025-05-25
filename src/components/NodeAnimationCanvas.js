import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

const NodeAnimationCanvas = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Generate initial nodes and connections
  useEffect(() => {
    // Generate random nodes
    const generatedNodes = [];
    for (let i = 0; i < 15; i++) {
      // Generate random wallet address
      const address = '0x' + Array.from({length: 40}, () => 
        '0123456789abcdef'[Math.floor(Math.random() * 16)]
      ).join('');
      
      generatedNodes.push({
        id: i,
        address: address,
        x: Math.random() * 100,
        y: Math.random() * 100,
        radius: 8,
        color: '#8A2BE2',
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        pulse: 0,
        tokenBalance: Math.floor(Math.random() * 1000),
        tokensBurned: Math.floor(Math.random() * 100)
      });
    }
    setNodes(generatedNodes);
    
    // Generate random connections
    const generatedConnections = [];
    for (let i = 0; i < 20; i++) {
      const a = Math.floor(Math.random() * generatedNodes.length);
      let b = Math.floor(Math.random() * generatedNodes.length);
      
      // Avoid self-connections
      while (b === a) {
        b = Math.floor(Math.random() * generatedNodes.length);
      }
      
      generatedConnections.push({
        from: a,
        to: b
      });
    }
    setConnections(generatedConnections);
  }, []);
  
  // Animation loop
  useEffect(() => {
    // Check if we're running in a browser environment
    if (typeof window === 'undefined' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let lastTimestamp = 0;
    
    // Update and draw function
    const animate = (timestamp) => {
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update nodes
      const updatedNodes = nodes.map(node => {
        // Update position
        const newX = node.x + node.vx;
        const newY = node.y + node.vy;
        
        // Bounce off edges
        let newVx = node.vx;
        let newVy = node.vy;
        
        if (newX < node.radius || newX > canvas.width - node.radius) {
          newVx *= -1;
        }
        if (newY < node.radius || newY > canvas.height - node.radius) {
          newVy *= -1;
        }
        
        // Update pulse
        const newPulse = node.pulse + 0.02;
        
        return {
          ...node,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          pulse: newPulse > Math.PI * 2 ? newPulse - Math.PI * 2 : newPulse
        };
      });
      
      // Draw connections
      for (const conn of connections) {
        const fromNode = updatedNodes[conn.from];
        const toNode = updatedNodes[conn.to];
        
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only draw connections within a certain distance
        if (distance < 200) {
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          
          // Highlight connections for selected node
          if (selectedNode && (conn.from === selectedNode.id || conn.to === selectedNode.id)) {
            ctx.strokeStyle = 'rgba(138, 43, 226, 0.8)';
            ctx.lineWidth = 2;
          } else {
            ctx.strokeStyle = 'rgba(138, 43, 226, 0.3)';
            ctx.lineWidth = 1;
          }
          
          ctx.stroke();
        }
      }
      
      // Draw nodes
      for (const node of updatedNodes) {
        // Draw pulse effect
        const pulseSize = 1 + 0.3 * Math.sin(node.pulse);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseSize * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(138, 43, 226, 0.2)';
        ctx.fill();
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        // Highlight hovered or selected node
        if (node === hoveredNode || (selectedNode && node.id === selectedNode.id)) {
          ctx.fillStyle = '#9A3FF2';
        } else {
          ctx.fillStyle = node.color;
        }
        
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Show address for hovered node
        if (node === hoveredNode) {
          const shortAddr = node.address.substring(0, 6) + '...' + 
            node.address.substring(node.address.length - 4);
          
          ctx.font = '12px Arial';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.fillText(shortAddr, node.x, node.y - node.radius * 2);
        }
      }
      
      // Update state
      setNodes(updatedNodes);
      
      // Continue animation
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationFrameId = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, connections, hoveredNode, selectedNode]);
  
  // Handle mouse events
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is over any node
    let nodeUnderMouse = null;
    for (const node of nodes) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < node.radius * 1.5) {
        nodeUnderMouse = node;
        break;
      }
    }
    
    // Update hovered node
    setHoveredNode(nodeUnderMouse);
    
    // Update cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = nodeUnderMouse ? 'pointer' : 'default';
    }
  };
  
  const handleClick = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if clicked on any node
    let nodeUnderMouse = null;
    for (const node of nodes) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < node.radius * 1.5) {
        nodeUnderMouse = node;
        break;
      }
    }
    
    // Update selected node
    setSelectedNode(nodeUnderMouse);
  };
  
  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={styles.canvas}
    />
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: '100%',
    backgroundColor: '#12121A',
    borderRadius: 8,
  },
});

export default NodeAnimationCanvas;