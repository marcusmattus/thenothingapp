/**
 * Basic Network Node Visualization
 * A simplified implementation for The Nothing App
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Get canvas container
  const container = document.getElementById('network-canvas-container');
  if (!container) {
    console.error('Network canvas container not found');
    return;
  }
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'node-canvas';
  container.appendChild(canvas);
  
  // Get canvas context
  const ctx = canvas.getContext('2d');
  
  // Log for debugging
  console.log('Canvas created with dimensions:', canvas.width, 'x', canvas.height);
  
  // Set canvas size to match container
  // Use a timer to ensure the container has been properly rendered
  setTimeout(() => {
    // Set fixed dimensions to ensure nodes are visible
    canvas.width = Math.max(container.offsetWidth, 800);
    canvas.height = Math.max(container.offsetHeight, 500);
    console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
    
    // Force redraw of nodes
    animate();
  }, 100);
  
  // Handle window resize with better visibility
  window.addEventListener('resize', function() {
    // Use maximum dimensions to ensure visibility
    canvas.width = Math.max(container.offsetWidth, 800);
    canvas.height = Math.max(container.offsetHeight, 500);
    console.log('Canvas resized after window resize:', canvas.width, 'x', canvas.height);
    
    // Recenter nodes to stay visible after resize
    for (const node of nodes) {
      // Keep nodes within canvas bounds
      if (node.x < node.radius * 2) node.x = node.radius * 2;
      if (node.x > canvas.width - node.radius * 2) node.x = canvas.width - node.radius * 2;
      if (node.y < node.radius * 2) node.y = node.radius * 2;
      if (node.y > canvas.height - node.radius * 2) node.y = canvas.height - node.radius * 2;
      
      // Keep welcome node at center
      if (node.isWelcome) {
        node.x = canvas.width / 2;
        node.y = canvas.height / 2;
      }
    }
  });
  
  // Node data with welcome nodes for new users
  const nodes = [];
  const connections = [];
  
  // Add a special welcome node for new users
  let welcomeNodeId = 0;
  
  // Create nodes with simpler representation
  // Get connected wallet address if available
  let connectedWalletAddress = '';
  if (window.avalancheConnector && window.avalancheConnector.isConnected) {
    connectedWalletAddress = window.avalancheConnector.getConnectedAddress ? 
      window.avalancheConnector.getConnectedAddress() : 
      '0x9b710EAa56B1a7D45f12C9c642D8CeE766405489'; // Default for testing
  }
  
  // Create a list of active users (including the current user)
  const activeUsers = [
    { address: '0x9b710EAa56B1a7D45f12C9c642D8CeE766405489', lastActive: Date.now() - 1000 * 60 }, // 1 minute ago
    { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', lastActive: Date.now() - 1000 * 60 * 5 }, // 5 minutes ago
    { address: '0x8fD00f170FDf3772C5ebdCD90bF257316c69BA45', lastActive: Date.now() - 1000 * 60 * 15 }, // 15 minutes ago
    { address: '0x19dE91Af973F404EDF5B4c093983a7c6E3EC8ccE', lastActive: Date.now() - 1000 * 60 * 45 }, // 45 minutes ago
    { address: '0x617F2E2fD72FD9D5503197092aC168c91465E7f2', lastActive: Date.now() - 1000 * 60 * 120 }, // 2 hours ago
  ];
  
  // Position nodes in a more spread out layout
  for (let i = 0; i < activeUsers.length; i++) {
    // Determine if this is the current user's node
    const isCurrentUser = activeUsers[i].address === connectedWalletAddress;
    
    // Position nodes in a circle
    const angle = (i / activeUsers.length) * Math.PI * 2;
    const radius = canvas.width * 0.3; // Distribute in a large circle
    
    const x = canvas.width / 2 + Math.cos(angle) * radius;
    const y = canvas.height / 2 + Math.sin(angle) * radius;
    
    // Add node with different color for current user
    nodes.push({
      id: i,
      address: activeUsers[i].address,
      x: x,
      y: y,
      radius: isCurrentUser ? 12 : 8, // Current user node is larger
      color: isCurrentUser ? '#FF6B6B' : '#8A2BE2', // Current user is red, others are purple
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      pulse: Math.random() * Math.PI * 2,
      tokenBalance: Math.floor(Math.random() * 1000),
      tokensBurned: Math.floor(Math.random() * 100),
      lastActive: activeUsers[i].lastActive,
      isCurrentUser: isCurrentUser
    });
  }
  
  // Add a few more network participants with different color
  for (let i = 0; i < 5; i++) {
    // Generate random wallet address
    const address = '0x' + Array.from({length: 40}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
    
    // Position randomly within the canvas
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * canvas.width * 0.3 + canvas.width * 0.1;
    const x = canvas.width / 2 + Math.cos(angle) * distance;
    const y = canvas.height / 2 + Math.sin(angle) * distance;
    
    nodes.push({
      id: activeUsers.length + i,
      address: address,
      x: x,
      y: y,
      radius: 6,
      color: '#4A90E2', // Blue color for other network participants
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      pulse: Math.random() * Math.PI * 2,
      tokenBalance: Math.floor(Math.random() * 500),
      tokensBurned: Math.floor(Math.random() * 50),
      lastActive: Date.now() - Math.random() * 1000 * 60 * 60 * 24,
      isCurrentUser: false
    });
  }
  
  // Create simple connections between nodes
  // Connect all active users to each other in a more simple way
  for (let i = 0; i < nodes.length; i++) {
    // Each node connects to 2-3 other nodes
    const connectionCount = 2 + Math.floor(Math.random() * 2);
    
    for (let j = 0; j < connectionCount; j++) {
      // Choose a random target node that's not self
      let targetId = Math.floor(Math.random() * nodes.length);
      
      // Avoid self-connections and duplicates
      while (targetId === i || connections.some(c => 
        (c.from === i && c.to === targetId) || (c.from === targetId && c.to === i)
      )) {
        targetId = Math.floor(Math.random() * nodes.length);
        
        // Break if we've tried too many times (avoid infinite loop)
        if (connections.length > nodes.length * 3) break;
      }
      
      // Don't add more connections if we've tried too many times
      if (targetId === i) continue;
      
      // Add connection with simple properties
      connections.push({
        from: i,
        to: targetId,
        // Simple color-based health indicator (no complex calculations)
        health: 0.5 + Math.random() * 0.5, // Just a simple random value
        lastActivity: Date.now() - Math.floor(Math.random() * 3600000), // Random activity within the last hour
        latency: 50 + Math.floor(Math.random() * 100) // Simple latency value
      });
    }
  }
  
  // Animation variables
  let hoveredNode = null;
  let selectedNode = null;
  
  // Add mouse move event listener
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is over any node
    hoveredNode = null;
    for (const node of nodes) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < node.radius * 1.5) {
        hoveredNode = node;
        canvas.style.cursor = 'pointer';
        break;
      }
    }
    
    if (!hoveredNode) {
      canvas.style.cursor = 'default';
    }
  });
  
  // Add click event listener
  canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if clicked on any node
    for (const node of nodes) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < node.radius * 1.5) {
        selectedNode = node;
        updateNodeInfo(node);
        return;
      }
    }
    
    // If clicked elsewhere, deselect node
    selectedNode = null;
    hideNodeInfo();
  });
  
  // Create node info panel
  const infoPanel = document.createElement('div');
  infoPanel.className = 'node-info-panel hidden';
  infoPanel.innerHTML = `
    <h3 class="node-info-title">Node Details</h3>
    <div class="node-info-content">
      <p>Select a node to see details</p>
    </div>
  `;
  container.appendChild(infoPanel);
  
  // Function to update node info panel
  function updateNodeInfo(node) {
    const content = infoPanel.querySelector('.node-info-content');
    
    // Special handling for network hub node
    if (node.isWelcome) {
      content.innerHTML = `
        <div class="welcome-message">
          <h3 style="margin-bottom: 10px;">Network Hub Status</h3>
          <p>Central node connecting all users in the network</p>
          <div class="node-info-item">
            <span class="node-info-label">Network ID</span>
            <span class="node-info-value">Avalanche L1 - Main</span>
          </div>
          
          <div class="node-stats">
            <div class="node-stat-item">
              <span class="node-stat-value">${node.tokenBalance.toFixed(2)}</span>
              <span class="node-stat-label">NTH Balance</span>
            </div>
            
            <div class="node-stat-item">
              <span class="node-stat-value">${activeUsers.length}</span>
              <span class="node-stat-label">Active Users</span>
            </div>
            
            <div class="node-stat-item">
              <span class="node-stat-value">${nodes.length}</span>
              <span class="node-stat-label">Total Nodes</span>
            </div>
          </div>
          
          <div class="node-info-item">
            <span class="node-info-label">Recently Active Users</span>
            <div style="font-size: 0.8rem; margin-top: 5px;">
              ${activeUsers.map((user, i) => 
                `<div style="margin-bottom: 3px;">${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}</div>`
              ).join('')}
            </div>
          </div>
        </div>
      `;
      infoPanel.classList.remove('hidden');
      return;
    }
    
    // For regular nodes
    // Format address for display
    const shortAddress = node.address.substring(0, 8) + '...' + 
      node.address.substring(node.address.length - 6);
    
    // Get node connections
    const nodeConnections = connections.filter(
      conn => conn.from === node.id || conn.to === node.id
    );
    
    // Calculate average connection health
    let totalHealth = 0;
    let healthyConnections = 0;
    let warningConnections = 0;
    let criticalConnections = 0;
    
    nodeConnections.forEach(conn => {
      totalHealth += conn.health;
      
      if (conn.health > 0.8) {
        healthyConnections++;
      } else if (conn.health > 0.4) {
        warningConnections++;
      } else {
        criticalConnections++;
      }
    });
    
    const avgHealth = nodeConnections.length > 0 ? 
      (totalHealth / nodeConnections.length * 100).toFixed(0) : 0;
    
    // Generate health indicator HTML
    let healthIndicator;
    if (avgHealth > 80) {
      healthIndicator = `<span class="health-indicator healthy">${avgHealth}%</span>`;
    } else if (avgHealth > 40) {
      healthIndicator = `<span class="health-indicator warning">${avgHealth}%</span>`;
    } else {
      healthIndicator = `<span class="health-indicator critical">${avgHealth}%</span>`;
    }
    
    content.innerHTML = `
      <div class="node-info-item">
        <span class="node-info-label">Address</span>
        <span class="node-info-value">${shortAddress}</span>
      </div>
      
      <div class="node-stats">
        <div class="node-stat-item">
          <span class="node-stat-value">${node.tokenBalance.toFixed(2)}</span>
          <span class="node-stat-label">NTH Balance</span>
        </div>
        
        <div class="node-stat-item">
          <span class="node-stat-value">${node.tokensBurned.toFixed(2)}</span>
          <span class="node-stat-label">Burned</span>
        </div>
        
        <div class="node-stat-item">
          <span class="node-stat-value">${nodeConnections.length}</span>
          <span class="node-stat-label">Connections</span>
        </div>
      </div>
      
      <div class="node-info-item">
        <span class="node-info-label">Network Health</span>
        <div class="health-bar-container">
          ${healthIndicator}
          <div class="health-bar">
            <div class="health-bar-fill" style="width: ${avgHealth}%"></div>
          </div>
        </div>
      </div>
      
      <div class="connection-summary">
        <div class="connection-type healthy">
          <span class="connection-count">${healthyConnections}</span>
          <span class="connection-label">Healthy</span>
        </div>
        <div class="connection-type warning">
          <span class="connection-count">${warningConnections}</span>
          <span class="connection-label">Warning</span>
        </div>
        <div class="connection-type critical">
          <span class="connection-count">${criticalConnections}</span>
          <span class="connection-label">Critical</span>
        </div>
      </div>
      
      <div class="node-info-item">
        <span class="node-info-label">Last Activity</span>
        <span class="node-info-value">Recently</span>
      </div>
    `;
    
    infoPanel.classList.remove('hidden');
  }
  
  // Function to hide node info panel
  function hideNodeInfo() {
    infoPanel.classList.add('hidden');
  }
  
  // Animation loop
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update node positions
    for (const node of nodes) {
      // Apply simple physics
      node.x += node.vx;
      node.y += node.vy;
      
      // Bounce off edges
      if (node.x < node.radius || node.x > canvas.width - node.radius) {
        node.vx *= -1;
      }
      if (node.y < node.radius || node.y > canvas.height - node.radius) {
        node.vy *= -1;
      }
      
      // Update pulse
      node.pulse += 0.02;
      if (node.pulse > Math.PI * 2) {
        node.pulse -= Math.PI * 2;
      }
    }
    
    // Draw connections with health indicators
    for (const conn of connections) {
      const fromNode = nodes[conn.from];
      const toNode = nodes[conn.to];
      
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only draw connections within a certain distance
      if (distance < 200) {
        // Draw the main connection line
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        
        // Determine color based on health
        let connectionColor;
        if (conn.health > 0.8) {
          // Healthy - green
          connectionColor = 'rgba(76, 175, 80, ';
        } else if (conn.health > 0.4) {
          // Medium - yellow/orange
          connectionColor = 'rgba(255, 152, 0, ';
        } else {
          // Unhealthy - red
          connectionColor = 'rgba(244, 67, 54, ';
        }
        
        // Highlight connections for selected node
        if (selectedNode && (conn.from === selectedNode.id || conn.to === selectedNode.id)) {
          ctx.strokeStyle = connectionColor + '0.8)';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = connectionColor + '0.5)';
          ctx.lineWidth = 1;
        }
        
        ctx.stroke();
        
        // Draw health indicator at the midpoint of the connection
        const midX = fromNode.x + dx * 0.5;
        const midY = fromNode.y + dy * 0.5;
        
        // Draw health indicator circle
        ctx.beginPath();
        ctx.arc(midX, midY, 4, 0, Math.PI * 2);
        ctx.fillStyle = connectionColor + '0.9)';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // Add pulse effect to health indicator based on activity
        const timeSinceActivity = Date.now() - conn.lastActivity;
        const pulseRate = Math.max(0.5, Math.min(2, 1000 / conn.latency)); // Faster pulse for lower latency
        
        if (timeSinceActivity < 3600000) { // Within the last hour
          const pulse = Math.sin(Date.now() * 0.005 * pulseRate) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(midX, midY, 4 + pulse * 3, 0, Math.PI * 2);
          ctx.fillStyle = connectionColor + '0.2)';
          ctx.fill();
        }
        
        // Draw particles on selected connections
        if (selectedNode && (conn.from === selectedNode.id || conn.to === selectedNode.id)) {
          const particleCount = Math.min(3, Math.floor(distance / 50));
          
          for (let i = 0; i < particleCount; i++) {
            // Particle speed depends on connection health and latency
            const particleSpeed = 1 + (1 - conn.latency/200) * 0.5;
            const t = ((Date.now() * particleSpeed / 1000) + (i / particleCount)) % 1;
            
            const x = fromNode.x + dx * t;
            const y = fromNode.y + dy * t;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
          }
        }
      }
    }
    
    // Draw nodes
    for (const node of nodes) {
      // Draw pulse effect with more visibility
      const pulseSize = 1 + 0.3 * Math.sin(node.pulse);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * pulseSize * 1.5, 0, Math.PI * 2);
      
      // Use standard glow for all nodes
      const pulseOpacity = 0.2 + Math.sin(node.pulse) * 0.1;
      ctx.fillStyle = `rgba(138, 43, 226, ${pulseOpacity})`;
      ctx.fill();
      
      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      
      // Highlight hovered or selected node - simplify colors
      if (node === hoveredNode || node === selectedNode) {
        ctx.fillStyle = '#9A3FF2'; // Brighter purple when selected
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(138, 43, 226, 0.6)';
      } else {
        // Central node (welcome node) is slightly different but not gold
        ctx.fillStyle = node.isWelcome ? '#8A2BE2' : node.color;
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow
      
      // Show address for hovered node
      if (node === hoveredNode) {
        if (node.isWelcome) {
          // Central node shows active users count
          ctx.font = 'bold 12px Arial';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.fillText('Active Users: 15', node.x, node.y - node.radius * 2.5);
          ctx.font = '11px Arial';
          ctx.fillStyle = '#CCCCCC';
          ctx.fillText('Click to view network stats', node.x, node.y - node.radius * 1.5);
        } else {
          // Normal address display
          const shortAddr = node.address.substring(0, 6) + '...' + 
            node.address.substring(node.address.length - 4);
          
          ctx.font = '12px Arial';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.fillText(shortAddr, node.x, node.y - node.radius * 2);
        }
      }
      
      // Always show the central node label
      if (node.isWelcome && node !== hoveredNode) {
        ctx.font = '10px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('Network Hub', node.x, node.y - node.radius * 1.5);
      }
    }
    
    // Continue animation
    requestAnimationFrame(animate);
  }
  
  // Start animation
  animate();
  
  console.log('Network node visualization initialized');
});