import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { connectWallet, disconnectWallet } from '../../services/wallet';
import { registerUser, checkUserRegistered } from '../../services/blockchain';

// Async thunks
export const connectWalletThunk = createAsyncThunk(
  'auth/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      const address = await connectWallet();
      return { address };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to connect wallet');
    }
  }
);

export const disconnectWalletThunk = createAsyncThunk(
  'auth/disconnectWallet',
  async (_, { rejectWithValue }) => {
    try {
      await disconnectWallet();
      return {};
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to disconnect wallet');
    }
  }
);

export const registerNewUser = createAsyncThunk(
  'auth/registerNewUser',
  async (address, { rejectWithValue }) => {
    try {
      // Check if user is already registered
      const isRegistered = await checkUserRegistered(address);
      
      if (!isRegistered) {
        // Register user and mint initial tokens
        await registerUser(address);
        return { registered: true };
      }
      
      return { registered: true }; // User was already registered
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to register user');
    }
  }
);

const initialState = {
  address: null,
  isConnecting: false,
  isRegistering: false,
  isRegistered: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setWalletAddress: (state, action) => {
      state.address = action.payload;
    },
    clearWalletAddress: (state) => {
      state.address = null;
    },
    setRegistered: (state, action) => {
      state.isRegistered = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect wallet
      .addCase(connectWalletThunk.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWalletThunk.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.address = action.payload.address;
      })
      .addCase(connectWalletThunk.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload || 'Failed to connect wallet';
      })
      
      // Disconnect wallet
      .addCase(disconnectWalletThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(disconnectWalletThunk.fulfilled, (state) => {
        state.address = null;
        state.isRegistered = false;
      })
      .addCase(disconnectWalletThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to disconnect wallet';
      })
      
      // Register new user
      .addCase(registerNewUser.pending, (state) => {
        state.isRegistering = true;
        state.error = null;
      })
      .addCase(registerNewUser.fulfilled, (state, action) => {
        state.isRegistering = false;
        state.isRegistered = action.payload.registered;
      })
      .addCase(registerNewUser.rejected, (state, action) => {
        state.isRegistering = false;
        state.error = action.payload || 'Failed to register user';
      });
  },
});

export const { 
  setWalletAddress, 
  clearWalletAddress, 
  setRegistered,
  clearErrors
} = authSlice.actions;

export default authSlice.reducer;