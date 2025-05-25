/**
 * Arena App Store Integration for The Nothing App
 * Based on the Arena App Store SDK
 */

// Arena App Store integration
const ArenaStore = {
  // App Store metadata
  metadata: {
    appName: 'The Nothing App',
    description: 'A blockchain-powered application visualizing the Avalanche L1 network with NTH token functionality',
    version: '1.0.0',
    author: 'Nothing Team',
    icon: '/public/images/nth-logo.svg',
    categories: ['blockchain', 'finance', 'network'],
    tags: ['avalanche', 'nothing', 'token', 'visualization']
  },
  
  // Initialize Arena Store integration
  init() {
    console.log('Initializing Arena Store integration');
    
    // Check if the app is running in Arena App Store
    this.isInArenaStore = this._checkArenaEnvironment();
    
    // Add Arena Store UI elements
    this._createUIElements();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // If in Arena Store, show banner
    if (this.isInArenaStore) {
      this._showArenaStoreBanner();
      document.body.classList.add('has-arena-banner');
    }
  },
  
  // Check if app is running inside Arena App Store
  _checkArenaEnvironment() {
    // Check for Arena App Store URL parameters or user agent
    const urlParams = new URLSearchParams(window.location.search);
    const inArena = urlParams.get('in_arena') === 'true' || 
                   window.location.hostname.includes('starsarena') ||
                   (window.navigator.userAgent && window.navigator.userAgent.includes('ArenaStore'));
    
    return inArena;
  },
  
  // Create UI elements for Arena Store integration
  _createUIElements() {
    // Only create the Arena button if we're on the main page and not already in Arena
    if (!this.isInArenaStore && window.location.pathname === '/') {
      const button = document.createElement('button');
      button.className = 'arena-store-button';
      button.setAttribute('id', 'arena-store-button');
      button.setAttribute('aria-label', 'Add to Arena Store');
      
      // Create button with Arena logo and text
      button.innerHTML = `
        <img src="public/images/arena-logo.svg" alt="Arena" />
        Add to Arena
      `;
      
      document.body.appendChild(button);
    }
    
    // Create Arena Store banner - only shown when running in Arena
    const banner = document.createElement('div');
    banner.className = 'arena-banner';
    banner.setAttribute('id', 'arena-banner');
    banner.textContent = 'Running in Arena App Store';
    document.body.appendChild(banner);
  },
  
  // Set up event listeners for Arena Store integration
  _setupEventListeners() {
    // Add to Arena Store button
    const button = document.getElementById('arena-store-button');
    if (button) {
      button.addEventListener('click', () => {
        this._addToArenaStore();
      });
    }
    
    // Listen for Arena Store messages
    window.addEventListener('message', (event) => {
      // Verify origin for security
      if (event.origin.includes('starsarena.org') || event.origin.includes('localhost')) {
        this._handleArenaMessage(event.data);
      }
    });
  },
  
  // Add app to Arena Store
  _addToArenaStore() {
    console.log('Adding to Arena Store');
    
    // Check if Arena Store SDK is available
    if (typeof window.ArenaAppStore !== 'undefined') {
      // Use SDK method
      window.ArenaAppStore.addApp(this.metadata);
    } else {
      // Since we don't have access to the real Arena Store yet,
      // we'll display a notification to the user
      this._showAddToStoreNotification();
      
      // In a real implementation, we would redirect to the Arena Store
      // const arenaStoreUrl = 'https://starsarena.io/store/add?';
      // const params = new URLSearchParams({
      //   name: this.metadata.appName,
      //   description: this.metadata.description,
      //   url: window.location.href,
      //   icon: window.location.origin + this.metadata.icon
      // });
      // window.open(arenaStoreUrl + params.toString(), '_blank');
    }
  },
  
  // Show a notification that the app would be added to Arena Store
  _showAddToStoreNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '70px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'linear-gradient(135deg, #8A2BE2, #4B0082)';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    notification.style.zIndex = '2000';
    notification.style.textAlign = 'center';
    notification.style.maxWidth = '90%';
    notification.style.fontWeight = 'bold';
    
    notification.textContent = 'The Nothing App would be added to your Arena Store';
    
    // Add notification to the page
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  },
  
  // Show Arena Store banner
  _showArenaStoreBanner() {
    const banner = document.getElementById('arena-banner');
    if (banner) {
      banner.classList.add('visible');
    }
  },
  
  // Handle messages from Arena App Store
  _handleArenaMessage(message) {
    console.log('Received message from Arena Store:', message);
    
    if (message.type === 'ARENA_CONNECTED') {
      this.isInArenaStore = true;
      this._showArenaStoreBanner();
      document.body.classList.add('has-arena-banner');
    }
  }
};

// Initialize Arena Store integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  ArenaStore.init();
});