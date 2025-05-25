/**
 * Simple Network Visualization for The Nothing App
 * Shows user nodes in different colors and simplified connections
 */

// Initialize the network visualization
function initNetworkVisualization(containerId = 'network-canvas-container') {
  // Get the container element
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID '${containerId}' not found.`);
    return;
  }
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = container.clientWidth || 800;
  canvas.height = container.clientHeight || 500;
  container.appendChild(canvas);
  
  // Get the 2D context
  const ctx = canvas.getContext('2d');
  
  // Resize canvas on window resize
  window.addEventListener('resize', () => {
    canvas.width = container.clientWidth || 800;
    canvas.height = container.clientHeight || 500;
    console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
  });
  
  // Initialize nodes and connections
  const nodes = [];
  const connections = [];
  
  // Get connected wallet address if available
  let connectedWalletAddress = '';
  if (window.avalancheConnector && window.avalancheConnector.isConnected) {
    try {
      connectedWalletAddress = window.avalancheConnector.getConnectedAddress();
    } catch (e) {
      // Fallback address for testing
      connectedWalletAddress = '0x9b710EAa56B1a7D45f12C9c642D8CeE766405489';
    }
  } else {
    // Fallback address for testing
    connectedWalletAddress = '0x9b710EAa56B1a7D45f12C9c642D8CeE766405489';
  }
  
  // Create sample user addresses
  const sampleAddresses = [
    '0x9b710EAa56B1a7D45f12C9c642D8CeE766405489',
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    '0x8fD00f170FDf3772C5ebdCD90bF257316c69BA45',
    '0x19dE91Af973F404EDF5B4c093983a7c6E3EC8ccE',
    '0x617F2E2fD72FD9D5503197092aC168c91465E7f2'
  ];
  
  // Generate nodes
  function generateNodes() {
    nodes.length = 0; // Clear existing nodes
    
    // Position nodes in a circle
    const radius = Math.min(canvas.width, canvas.height) * 0.35;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Add user nodes first
    for (let i = 0; i < sampleAddresses.length; i++) {
      const angle = (i / sampleAddresses.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Check if this is the current user's node
      const isCurrentUser = sampleAddresses[i] === connectedWalletAddress;
      
      nodes.push({
        id: i,
        address: sampleAddresses[i],
        x: x,
        y: y,
        targetX: x, // For smooth animation
        targetY: y, // For smooth animation
        radius: isCurrentUser ? 8 : 6, // User node is larger, but more minimal
        color: isCurrentUser ? '#AAAAAA' : '#666666', // User is light gray, others are medium gray
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.05 + Math.random() * 0.05,
        tokenBalance: 100 + Math.floor(Math.random() * 900),
        isCurrentUser: isCurrentUser
      });
    }
    
    // Add a few other random nodes
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius * 0.7;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Generate random wallet address
      const address = '0x' + Array.from({length: 40}, () => 
        '0123456789abcdef'[Math.floor(Math.random() * 16)]
      ).join('');
      
      nodes.push({
        id: sampleAddresses.length + i,
        address: address,
        x: x,
        y: y,
        targetX: x,
        targetY: y,
        radius: 5,
        color: '#333333', // Other nodes are dark gray
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        tokenBalance: Math.floor(Math.random() * 500),
        isCurrentUser: false
      });
    }
    
    generateConnections();
  }
  
  // Generate connections between nodes
  function generateConnections() {
    connections.length = 0; // Clear existing connections
    
    // Find user node
    const userNode = nodes.find(node => node.isCurrentUser);
    
    if (userNode) {
      // Connect user node to 3-4 other nodes
      const userConnections = Math.floor(Math.random() * 2) + 3; // 3-4 connections
      
      let connectedCount = 0;
      for (let i = 0; i < nodes.length && connectedCount < userConnections; i++) {
        if (nodes[i].id !== userNode.id) {
          connections.push({
            from: userNode.id,
            to: nodes[i].id,
            strength: 0.7 + Math.random() * 0.3 // Strong connections for user
          });
          connectedCount++;
        }
      }
    }
    
    // Add some random connections between other nodes
    for (let i = 0; i < nodes.length; i++) {
      // Skip user node as we already connected it
      if (nodes[i].isCurrentUser) continue;
      
      // Add 1-2 connections for each node
      const connectionCount = Math.floor(Math.random() * 2) + 1;
      
      for (let j = 0; j < connectionCount; j++) {
        // Choose a random target node
        let targetIdx = Math.floor(Math.random() * nodes.length);
        
        // Avoid self-connections and duplicates
        let attempts = 0;
        while ((targetIdx === i || 
               connections.some(c => 
                 (c.from === i && c.to === targetIdx) || 
                 (c.from === targetIdx && c.to === i))) && 
               attempts < 10) {
          targetIdx = Math.floor(Math.random() * nodes.length);
          attempts++;
        }
        
        if (attempts < 10) {
          connections.push({
            from: i,
            to: targetIdx,
            strength: 0.3 + Math.random() * 0.5 // Normal strength for other connections
          });
        }
      }
    }
  }
  
  // Animation variables
  let hoveredNode = null;
  let animationFrameId = null;
  
  // Draw a node
  function drawNode(node) {
    ctx.beginPath();
    
    // Draw the main circle
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    
    // Draw the pulse effect
    const pulseSize = node.radius * (1 + 0.3 * Math.sin(node.pulse));
    ctx.beginPath();
    ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = node.isCurrentUser ? 
                   'rgba(255, 107, 107, 0.15)' : 
                   'rgba(138, 43, 226, 0.15)';
    ctx.fill();
    
    // Update the pulse animation
    node.pulse += node.pulseSpeed;
    
    // If this is the user's node, add a highlight ring
    if (node.isCurrentUser) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  
  // Draw a connection between nodes
  function drawConnection(fromNode, toNode, strength) {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    
    // Line style based on connection type
    if (fromNode.isCurrentUser || toNode.isCurrentUser) {
      ctx.strokeStyle = `rgba(255, 107, 107, ${strength * 0.7})`;
    } else {
      ctx.strokeStyle = `rgba(138, 43, 226, ${strength * 0.5})`;
    }
    
    ctx.lineWidth = 1 + strength;
    ctx.stroke();
    
    // Draw particles along the connection
    drawParticles(fromNode, toNode, distance, dx, dy, strength);
  }
  
  // Draw particles along a connection to show data flow
  function drawParticles(fromNode, toNode, distance, dx, dy, strength) {
    // Number of particles based on connection strength
    const particleCount = Math.floor(3 * strength);
    
    // Particle color based on whether it's connected to user node
    const particleColor = (fromNode.isCurrentUser || toNode.isCurrentUser) ? 
                         'rgba(255, 107, 107, 0.7)' : 
                         'rgba(138, 43, 226, 0.7)';
    
    for (let i = 0; i < particleCount; i++) {
      // Position particle along the connection
      const progress = (Date.now() / 1000 + i / particleCount) % 1;
      const x = fromNode.x + dx * progress;
      const y = fromNode.y + dy * progress;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(x, y, 1 + strength, 0, Math.PI * 2);
      ctx.fillStyle = particleColor;
      ctx.fill();
    }
  }
  
  // Draw tooltip for hovered node
  function drawTooltip() {
    if (!hoveredNode) return;
    
    const x = hoveredNode.x + 20;
    const y = hoveredNode.y - 20;
    
    // Shorten address for display
    const addressDisplay = hoveredNode.address.substring(0, 6) + '...' + 
                          hoveredNode.address.substring(hoveredNode.address.length - 4);
    
    // Create tooltip text
    let tooltipText = hoveredNode.isCurrentUser ? 'YOUR NODE' : 'Network Node';
    tooltipText += `\nAddress: ${addressDisplay}`;
    tooltipText += `\nBalance: ${hoveredNode.tokenBalance.toLocaleString()} $NTH`;
    
    // Calculate tooltip dimensions
    const fontSize = 12;
    ctx.font = `${fontSize}px Arial`;
    const tooltipLines = tooltipText.split('\n');
    const maxWidth = Math.max(...tooltipLines.map(line => ctx.measureText(line).width));
    const tooltipWidth = maxWidth + 20;
    const tooltipHeight = tooltipLines.length * (fontSize + 4) + 10;
    
    // Draw tooltip background
    const bgColor = hoveredNode.isCurrentUser ? 
                   'rgba(255, 107, 107, 0.8)' : 
                   'rgba(20, 20, 30, 0.8)';
    
    // Draw rounded rectangle
    ctx.beginPath();
    const radius = 5;
    ctx.moveTo(x + radius, y - tooltipHeight);
    ctx.lineTo(x + tooltipWidth - radius, y - tooltipHeight);
    ctx.quadraticCurveTo(x + tooltipWidth, y - tooltipHeight, x + tooltipWidth, y - tooltipHeight + radius);
    ctx.lineTo(x + tooltipWidth, y - radius);
    ctx.quadraticCurveTo(x + tooltipWidth, y, x + tooltipWidth - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y - radius);
    ctx.lineTo(x, y - tooltipHeight + radius);
    ctx.quadraticCurveTo(x, y - tooltipHeight, x + radius, y - tooltipHeight);
    ctx.closePath();
    
    ctx.fillStyle = bgColor;
    ctx.fill();
    
    // Draw tooltip text
    ctx.fillStyle = 'white';
    ctx.font = `${fontSize}px Arial`;
    tooltipLines.forEach((line, i) => {
      ctx.fillText(line, x + 10, y - tooltipHeight + 20 + i * (fontSize + 4));
    });
  }
  
  // Animation loop
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    for (const connection of connections) {
      const fromNode = nodes.find(node => node.id === connection.from);
      const toNode = nodes.find(node => node.id === connection.to);
      if (fromNode && toNode) {
        drawConnection(fromNode, toNode, connection.strength);
      }
    }
    
    // Draw nodes
    for (const node of nodes) {
      drawNode(node);
    }
    
    // Draw tooltip for hovered node
    drawTooltip();
    
    // Continue animation
    animationFrameId = requestAnimationFrame(animate);
  }
  
  // Start the animation
  function startAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animate();
  }
  
  // Mouse move event handler
  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is over any node
    hoveredNode = null;
    for (const node of nodes) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= node.radius * 1.5) {
        hoveredNode = node;
        canvas.style.cursor = 'pointer';
        break;
      }
    }
    
    if (!hoveredNode) {
      canvas.style.cursor = 'default';
    }
  }
  
  // Mouse click event handler
  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if clicked on any node
    for (const node of nodes) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= node.radius * 1.5) {
        // Show node info
        showNodeInfo(node);
        return;
      }
    }
  }
  
  // Show node information
  function showNodeInfo(node) {
    // Create a simple alert with node info
    const addressDisplay = node.address.substring(0, 6) + '...' + 
                          node.address.substring(node.address.length - 4);
    
    // Count connections
    const nodeConnections = connections.filter(c => 
      c.from === node.id || c.to === node.id
    ).length;
    
    let message = node.isCurrentUser ? 'YOUR NODE\n' : 'NETWORK NODE\n';
    message += `Address: ${node.address}\n`;
    message += `Balance: ${node.tokenBalance.toLocaleString()} $NTH\n`;
    message += `Connected to ${nodeConnections} nodes`;
    
    alert(message);
  }
  
  // Set up event listeners
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('click', handleClick);
  
  // Initialize and start
  generateNodes();
  startAnimation();
  
  console.log('Network node visualization initialized');
  
  // Return public API
  return {
    refresh: function() {
      generateNodes();
    }
  };
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  initNetworkVisualization();
});