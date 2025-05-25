import firebase from 'firebase/app';
import 'firebase/database';
import { getNodePosition } from '../utils/nodeGenerator';
import { store } from '../redux/store';
import { addNode, updateNodes } from '../redux/slices/networkSlice';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your_firebase_api_key",
  authDomain: "nothing-app.firebaseapp.com",
  databaseURL: "https://nothing-app.firebaseio.com",
  projectId: "nothing-app",
  storageBucket: "nothing-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
let nodesRef = null;
let nodesListener = null;

/**
 * Add a new node to the network
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<void>}
 */
export const addNodeToNetwork = async (walletAddress) => {
  try {
    if (!walletAddress) return;
    
    const nodePosition = getNodePosition(walletAddress);
    const timestamp = firebase.database.ServerValue.TIMESTAMP;
    
    await database.ref(`nodes/${walletAddress.toLowerCase()}`).set({
      address: walletAddress.toLowerCase(),
      x: nodePosition.x,
      y: nodePosition.y,
      timestamp
    });
  } catch (error) {
    console.error('Error adding node to network:', error);
    throw error;
  }
};

/**
 * Subscribe to node updates
 * @returns {void}
 */
export const subscribeToNodeUpdates = () => {
  try {
    if (!nodesRef) {
      nodesRef = database.ref('nodes');
      
      nodesListener = nodesRef.on('value', (snapshot) => {
        const nodes = [];
        
        snapshot.forEach((childSnapshot) => {
          const node = childSnapshot.val();
          nodes.push(node);
        });
        
        store.dispatch(updateNodes(nodes));
      });
      
      // Listen for new nodes
      nodesRef.on('child_added', (snapshot) => {
        const node = snapshot.val();
        store.dispatch(addNode(node));
      });
    }
  } catch (error) {
    console.error('Error subscribing to node updates:', error);
  }
};

/**
 * Unsubscribe from node updates
 * @returns {void}
 */
export const unsubscribeFromNodeUpdates = () => {
  if (nodesRef && nodesListener) {
    nodesRef.off('value', nodesListener);
    nodesRef.off('child_added');
    nodesRef = null;
    nodesListener = null;
  }
};

/**
 * Get all network nodes
 * @returns {Promise<Array>} Array of nodes
 */
export const getNetworkNodes = async () => {
  try {
    const snapshot = await database.ref('nodes').once('value');
    const nodes = [];
    
    snapshot.forEach((childSnapshot) => {
      const node = childSnapshot.val();
      nodes.push(node);
    });
    
    return nodes;
  } catch (error) {
    console.error('Error getting network nodes:', error);
    throw error;
  }
};
