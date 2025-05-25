import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import WalletScreen from '../screens/WalletScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import theme from '../styles/theme';
import { useSelector } from 'react-redux';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { address } = useSelector(state => state.auth);
  const isConnected = !!address;

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{
          gestureEnabled: false, // Prevent going back during signup
        }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          gestureEnabled: false, // User must use the wallet button to go back
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
