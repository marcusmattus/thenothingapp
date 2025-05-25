import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NetworkVisualization from '../components/NetworkVisualization';
import TokenActions from '../components/TokenActions';

const Dashboard = () => {
  const { currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('network');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Container>
      <Header>
        <Logo>
          <LogoIcon>
            <circle
              cx="20"
              cy="20"
              r="15"
              stroke="#8A2BE2"
              strokeWidth="2"
              fill="transparent"
            />
            <path
              d="M15,20 L25,20 M20,15 L20,25"
              stroke="#8A2BE2"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </LogoIcon>
          <LogoText>The Nothing App</LogoText>
        </Logo>
        <UserInfo>
          <UserAddress>{currentUser?.address}</UserAddress>
          <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
        </UserInfo>
      </Header>

      <Content>
        <Sidebar>
          <TabButton 
            onClick={() => setActiveTab('network')}
            className={activeTab === 'network' ? 'active' : ''}
          >
            Network
          </TabButton>
          <TabButton 
            onClick={() => setActiveTab('tokens')}
            className={activeTab === 'tokens' ? 'active' : ''}
          >
            Tokens
          </TabButton>
        </Sidebar>

        <MainContent>
          {activeTab === 'network' ? (
            <NetworkVisualization userAddress={currentUser?.address} />
          ) : (
            <TokenActions userAddress={currentUser?.address} />
          )}
        </MainContent>
      </Content>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.space.lg};
  background-color: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
`;

const LogoIcon = styled.svg`
  width: 40px;
  height: 40px;
  margin-right: ${({ theme }) => theme.space.sm};
`;

const LogoText = styled.h1`
  font-size: 1.2rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserAddress = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-right: ${({ theme }) => theme.space.md};
  background-color: rgba(255, 255, 255, 0.05);
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
`;

const SignOutButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: all ${({ theme }) => theme.animations.fast};
  
  &:hover {
    background-color: rgba(138, 43, 226, 0.1);
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
`;

const Sidebar = styled.div`
  width: 200px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.space.lg} 0;
`;

const TabButton = styled.button`
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.lg};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: none;
  border-left: 3px solid transparent;
  font-size: 1rem;
  transition: all ${({ theme }) => theme.animations.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    color: ${({ theme }) => theme.colors.accent};
    border-left-color: ${({ theme }) => theme.colors.accent};
    background-color: rgba(138, 43, 226, 0.1);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.space.lg};
  background-color: ${({ theme }) => theme.colors.background};
`;

export default Dashboard;