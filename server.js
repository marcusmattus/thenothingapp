/**
 * Server for The Nothing App
 * Optimized for production deployment
 * Serves static files and provides API endpoints
 */

// Create a basic HTTP server to serve the static files
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Track connected users (simulated for API responses)
const connectedUsers = {
  count: 0,
  lastConnected: new Date().toISOString()
};

// Handle API requests
function handleApiRequest(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request (for CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse the URL to get the API endpoint
  const parsedUrl = url.parse(req.url);
  const endpoint = parsedUrl.pathname;

  // Handle different API endpoints
  if (endpoint === '/api/network/status' && req.method === 'GET') {
    // Return network status
    const status = {
      networkName: 'Avalanche Mainnet',
      chainId: '0xa86a',
      connectedNodes: Math.max(3, connectedUsers.count),
      activeUsers: Math.floor(connectedUsers.count * 0.7),
      lastUpdate: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
    return;
  }

  if (endpoint === '/api/network/nodes' && req.method === 'GET') {
    // Generate dynamic network nodes
    const nodeCount = Math.max(5, Math.min(50, connectedUsers.count));
    const nodes = [];

    // Always include the default user node
    nodes.push({
      id: 1,
      address: '0x9b710EAa56B1a7D45f12C9c642D8CeE766405489',
      isCurrentUser: true,
      lastActive: Date.now() - 60000,
      tokenBalance: 1000,
      tokensBurned: 50
    });

    // Add additional nodes
    const addresses = [
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      '0x8fD00f170FDf3772C5ebdCD90bF257316c69BA45',
      '0xD3CdA913deB6f67967B99D67aCDFa1712C293601',
      '0x21b42413bA931038f35e7A5224FaDb065d297D3B',
      '0x71c7656ec7ab88b098defb751b7401b5f6d8976f',
      '0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8',
      '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'
    ];

    for (let i = 2; i <= nodeCount; i++) {
      const address = addresses[(i - 2) % addresses.length];
      nodes.push({
        id: i,
        address: address,
        isCurrentUser: false,
        lastActive: Date.now() - (Math.random() * 3600000),
        tokenBalance: Math.floor(Math.random() * 10000),
        tokensBurned: Math.floor(Math.random() * 1000)
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(nodes));
    return;
  }

  if (endpoint === '/api/token/stats' && req.method === 'GET') {
    // Return token statistics
    const stats = {
      symbol: 'NTH',
      name: 'Nothing Token',
      totalSupply: 10000000000,
      circulatingSupply: 1000000000 - 500000, // Account for burned tokens
      burnedTokens: 500000,
      holders: 500 + connectedUsers.count,
      price: 0.01,
      marketCap: (1000000000 - 500000) * 0.01,
      lastUpdate: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
    return;
  }

  if (endpoint === '/api/user/balance' && req.method === 'GET') {
    // Return user token balance (simulated)
    const balance = {
      address: '0x9b710EAa56B1a7D45f12C9c642D8CeE766405489',
      balance: 1000,
      tokensBurned: 50,
      lastTransaction: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(balance));
    return;
  }

  // Handle 404 for unknown API endpoints
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    error: 'Not found',
    message: `API endpoint ${endpoint} not found`
  }));
}

// Create the HTTP server
const server = http.createServer((req, res) => {
  // Parse the URL
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // Log request (omit in high-traffic production)
  console.log(`Request for ${pathname}`);

  // Simulate user connections for API stats
  if (Math.random() > 0.9 && req.headers['user-agent']) {
    connectedUsers.count = Math.min(500, connectedUsers.count + 1);
    connectedUsers.lastConnected = new Date().toISOString();
  }

  // Handle API endpoints
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }

  // Normalize the URL for file serving
  let filePath = '.' + pathname;
  if (filePath === './') {
    filePath = './index.html';
  }

  // Get the file extension
  const extname = path.extname(filePath);

  // Set the content type based on the file extension
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      // If the file doesn't exist, serve the index.html file (for SPA routing)
      if (error.code === 'ENOENT') {
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Set caching headers for static assets
      const headers = { 'Content-Type': contentType };
      if (extname !== '.html') {
        // Cache static assets for 1 day
        headers['Cache-Control'] = 'public, max-age=86400';
      } else {
        // Don't cache HTML
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      }

      // Success - serve the file
      res.writeHead(200, headers);
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`Server is ready for deployment!`);
});