/**
 * Nothing Style - Minimal grayscale styling for The Nothing App
 */

document.addEventListener('DOMContentLoaded', function() {
  // Update node colors to grayscale
  updateNodeColors();
  
  // Apply minimalist styling to the app
  applyMinimalistStyling();
});

/**
 * Update node colors to grayscale for a more minimalist look
 */
function updateNodeColors() {
  // Override node colors in the network visualization
  window.addEventListener('network-nodes-initialized', function(e) {
    if (e.detail && e.detail.nodes) {
      e.detail.nodes.forEach(node => {
        if (node.isCurrentUser) {
          node.color = '#AAAAAA'; // Light gray for current user
        } else {
          node.color = node.isCurrentUser ? '#AAAAAA' : '#555555'; // Gray for other users
        }
      });
    }
  });
  
  // Update legend colors
  const legendItems = document.querySelectorAll('.legend-color');
  if (legendItems.length >= 3) {
    // Your node
    legendItems[0].style.backgroundColor = '#AAAAAA';
    // Other users
    legendItems[1].style.backgroundColor = '#555555';
    // Network participants
    legendItems[2].style.backgroundColor = '#333333';
  }
}

/**
 * Apply minimalist styling to the app
 */
function applyMinimalistStyling() {
  // Create a style element
  const style = document.createElement('style');
  
  // Add minimalist styles
  style.textContent = `
    /* Minimalist header styling */
    .header {
      border-bottom: 1px solid #222222;
      background-color: #050505;
    }
    
    /* Minimalist button styling */
    .tab-button {
      background-color: transparent;
      color: #888888;
      border: none;
      padding: 12px 16px;
      transition: color 0.2s;
    }
    
    .tab-button:hover {
      color: #AAAAAA;
    }
    
    .tab-button.active {
      color: #DDDDDD;
      border-bottom: 1px solid #555555;
    }
    
    /* Minimalist card styling */
    .visualization-container, .token-container {
      background-color: #0A0A0A;
      border: 1px solid #181818;
      box-shadow: none;
    }
    
    /* Token actions styling */
    .token-action-form {
      background-color: #0A0A0A;
      border: 1px solid #181818;
    }
    
    .token-action-button {
      background-color: #333333;
      color: #DDDDDD;
      border: none;
    }
    
    .token-action-button:hover {
      background-color: #444444;
    }
    
    /* Input styling */
    input[type="number"], input[type="text"] {
      background-color: #111111;
      border: 1px solid #222222;
      color: #DDDDDD;
    }
    
    /* Connection styling */
    .connection {
      background-color: #333333;
      opacity: 0.5;
    }
    
    /* Pulse effect */
    .node-pulse {
      background-color: rgba(170, 170, 170, 0.1);
    }
  `;
  
  // Append the style element to the head
  document.head.appendChild(style);
}