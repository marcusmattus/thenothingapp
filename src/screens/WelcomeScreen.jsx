import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import theme from '../styles/theme';
import { APP_NAME } from '../constants';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Svg height={120} width={120} viewBox="0 0 100 100">
            <Circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke={theme.colors.accent} 
              strokeWidth="2" 
            />
            <Path 
              d="M30,50 L70,50 M50,30 L50,70" 
              stroke={theme.colors.accent} 
              strokeWidth="2" 
              strokeLinecap="round" 
            />
          </Svg>
          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>Start from nothing, build something together</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Connect your wallet to join the network, mint your $NTH token, 
            and become a node in our decentralized visualization.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={styles.connectButtonText}>Connect Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.exploreButtonText}>Explore Demo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  descriptionContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  connectButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  connectButtonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  exploreButton: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  exploreButtonText: {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;