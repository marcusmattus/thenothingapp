import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import networkReducer from './slices/networkSlice';
import tokenReducer from './slices/tokenSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    network: networkReducer,
    token: tokenReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in specific paths
        ignoredActions: ['network/updateNodes', 'network/addNode'],
        ignoredPaths: ['network.nodes'],
      },
    }),
});
