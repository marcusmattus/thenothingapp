import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Pages
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Theme
import { theme } from './utils/theme';

// Global styles
import GlobalStyle from './utils/globalStyles';

const App = () => {
  const { currentUser, loading } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    if (!currentUser) return <Navigate to="/signin" />;
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
};

export default App;