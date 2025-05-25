/**
 * Tab Navigation for The Nothing App
 * Handles switching between network and token tabs
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get tab buttons and content elements
  const networkTabButton = document.getElementById('network-tab-button');
  const tokensTabButton = document.getElementById('tokens-tab-button');
  const networkContent = document.getElementById('network-content');
  const tokenContent = document.getElementById('token-content');

  // Add event listeners to tab buttons
  if (networkTabButton && tokensTabButton) {
    networkTabButton.addEventListener('click', () => {
      // Update active tab
      networkTabButton.classList.add('active');
      tokensTabButton.classList.remove('active');
      
      // Show/hide content
      networkContent.classList.remove('hidden');
      tokenContent.classList.add('hidden');
      
      // Trigger resize event to refresh network visualization
      window.dispatchEvent(new Event('resize'));
    });

    tokensTabButton.addEventListener('click', () => {
      // Update active tab
      tokensTabButton.classList.add('active');
      networkTabButton.classList.remove('active');
      
      // Show/hide content
      tokenContent.classList.remove('hidden');
      networkContent.classList.add('hidden');
    });
  }
});