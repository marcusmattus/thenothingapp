import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTokenInfo, getTokenPrice } from '../../services/blockchain';

export const fetchTokenInfo = createAsyncThunk(
  'token/fetchInfo',
  async (walletAddress, { rejectWithValue }) => {
    try {
      if (!walletAddress) {
        return { balance: 0, price: 0 };
      }
      const tokenInfo = await getTokenInfo(walletAddress);
      return tokenInfo;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTokenHistory = createAsyncThunk(
  'token/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      // This would typically fetch price history from a backend
      // Mocking sample data for now
      const mockHistory = Array(24)
        .fill(0)
        .map((_, i) => {
          const timestamp = Date.now() - (23 - i) * 3600 * 1000;
          const price = 0.01 + Math.random() * 0.02;
          return { timestamp, price };
        });
      
      return mockHistory;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  balance: 0,
  tokenPrice: 0,
  priceHistory: [],
  loading: false,
  error: null,
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
    updateTokenPrice: (state, action) => {
      state.tokenPrice = action.payload;
    },
    clearTokenData: (state) => {
      state.balance = 0;
      state.tokenPrice = 0;
      state.priceHistory = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokenInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokenInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.tokenPrice = action.payload.price;
      })
      .addCase(fetchTokenInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTokenHistory.fulfilled, (state, action) => {
        state.priceHistory = action.payload;
      });
  },
});

export const { updateBalance, updateTokenPrice, clearTokenData } = tokenSlice.actions;

export default tokenSlice.reducer;
