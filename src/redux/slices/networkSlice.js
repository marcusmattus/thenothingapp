import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNetworkNodes } from '../../services/firebase';

export const fetchNetworkNodes = createAsyncThunk(
  'network/fetchNodes',
  async (_, { rejectWithValue }) => {
    try {
      const nodes = await getNetworkNodes();
      return nodes;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  nodes: [],
  loading: false,
  error: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    updateNodes: (state, action) => {
      state.nodes = action.payload;
    },
    addNode: (state, action) => {
      const existingNodeIndex = state.nodes.findIndex(
        node => node.address === action.payload.address
      );
      
      if (existingNodeIndex !== -1) {
        // Update existing node
        state.nodes[existingNodeIndex] = action.payload;
      } else {
        // Add new node
        state.nodes.push(action.payload);
      }
    },
    clearNetwork: (state) => {
      state.nodes = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNetworkNodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetworkNodes.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload;
      })
      .addCase(fetchNetworkNodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateNodes, addNode, clearNetwork } = networkSlice.actions;

export default networkSlice.reducer;
