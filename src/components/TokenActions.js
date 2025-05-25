import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';

const TokenActions = ({ userAddress }) => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [burnAmount, setBurnAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch token info on component mount
  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would fetch from the blockchain or backend
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        setTokenBalance(100);
        setTokenPrice(0.05); // In AVAX
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching token info:', err);
        setError('Failed to load token information. Please try again.');
        setIsLoading(false);
      }
    };

    if (userAddress) {
      fetchTokenInfo();
    }
  }, [userAddress]);

  // Handle burn token action
  const handleBurn = async (e) => {
    e.preventDefault();
    
    if (!burnAmount || Number(burnAmount) <= 0 || Number(burnAmount) > tokenBalance) {
      setError('Please enter a valid amount to burn');
      return;
    }
    
    try {
      setAction('burning');
      setError('');
      
      // In a real app, this would call a blockchain transaction
      // Simulating transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update state after successful burn
      setTokenBalance(prev => prev - Number(burnAmount));
      setTokenPrice(prev => prev * 1.05); // Simple price increase simulation
      
      setBurnAmount('');
      setSuccessMessage(`Successfully burned ${burnAmount} $NTH tokens`);
      setAction(null);
    } catch (err) {
      console.error('Error burning tokens:', err);
      setError('Failed to burn tokens. Please try again.');
      setAction(null);
    }
  };

  // Handle sell token action
  const handleSell = async (e) => {
    e.preventDefault();
    
    if (!sellAmount || Number(sellAmount) <= 0 || Number(sellAmount) > tokenBalance) {
      setError('Please enter a valid amount to sell');
      return;
    }
    
    try {
      setAction('selling');
      setError('');
      
      // In a real app, this would call a blockchain transaction
      // Simulating transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate AVAX to receive (simple calculation)
      const avaxToReceive = Number(sellAmount) * tokenPrice;
      
      // Update state after successful sell
      setTokenBalance(prev => prev - Number(sellAmount));
      setTokenPrice(prev => prev * 0.95); // Simple price decrease simulation
      
      setSellAmount('');
      setSuccessMessage(`Successfully sold ${sellAmount} $NTH tokens for ${avaxToReceive.toFixed(4)} AVAX`);
      setAction(null);
    } catch (err) {
      console.error('Error selling tokens:', err);
      setError('Failed to sell tokens. Please try again.');
      setAction(null);
    }
  };

  // Clear messages when user starts typing
  useEffect(() => {
    if (burnAmount || sellAmount) {
      setError('');
      setSuccessMessage('');
    }
  }, [burnAmount, sellAmount]);

  if (isLoading) {
    return <LoadingContainer>Loading token information...</LoadingContainer>;
  }

  return (
    <Container>
      <Title>$NTH Token Actions</Title>
      <Description>
        Manage your Nothing Token ($NTH) on the Avalanche blockchain.
        Burn tokens to increase their value or sell them for AVAX.
      </Description>
      
      <TokenInfoSection>
        <TokenInfoCard>
          <TokenInfoTitle>Your Balance</TokenInfoTitle>
          <TokenInfoValue>{tokenBalance} $NTH</TokenInfoValue>
        </TokenInfoCard>
        
        <TokenInfoCard>
          <TokenInfoTitle>Current Price</TokenInfoTitle>
          <TokenInfoValue>{tokenPrice.toFixed(4)} AVAX</TokenInfoValue>
        </TokenInfoCard>
        
        <TokenInfoCard>
          <TokenInfoTitle>Value</TokenInfoTitle>
          <TokenInfoValue>{(tokenBalance * tokenPrice).toFixed(4)} AVAX</TokenInfoValue>
        </TokenInfoCard>
      </TokenInfoSection>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      
      <ActionsSection>
        <ActionCard as={motion.div} whileHover={{ y: -5 }}>
          <ActionTitle>Burn Tokens</ActionTitle>
          <ActionDescription>
            Burn your $NTH tokens to increase the value of remaining tokens.
            Burning removes tokens from circulation permanently.
          </ActionDescription>
          
          <Form onSubmit={handleBurn}>
            <InputGroup>
              <Label htmlFor="burnAmount">Amount to Burn</Label>
              <Input
                type="number"
                id="burnAmount"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={tokenBalance.toString()}
              />
            </InputGroup>
            
            <Button type="submit" disabled={action === 'burning'}>
              {action === 'burning' ? 'Burning...' : 'Burn Tokens'}
            </Button>
          </Form>
        </ActionCard>
        
        <ActionCard as={motion.div} whileHover={{ y: -5 }}>
          <ActionTitle>Sell Tokens</ActionTitle>
          <ActionDescription>
            Sell your $NTH tokens to receive AVAX in return.
            Selling tokens will slightly decrease the token price.
          </ActionDescription>
          
          <Form onSubmit={handleSell}>
            <InputGroup>
              <Label htmlFor="sellAmount">Amount to Sell</Label>
              <Input
                type="number"
                id="sellAmount"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={tokenBalance.toString()}
              />
            </InputGroup>
            
            {sellAmount && (
              <EstimatedReturn>
                You will receive approximately {(Number(sellAmount) * tokenPrice).toFixed(4)} AVAX
              </EstimatedReturn>
            )}
            
            <Button type="submit" disabled={action === 'selling'}>
              {action === 'selling' ? 'Selling...' : 'Sell Tokens'}
            </Button>
          </Form>
        </ActionCard>
      </ActionsSection>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.space.lg};
  height: 100%;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.space.lg};
  font-size: 0.9rem;
  line-height: 1.6;
`;

const TokenInfoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.space.lg};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const TokenInfoCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.space.lg};
  text-align: center;
`;

const TokenInfoTitle = styled.h3`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const TokenInfoValue = styled.div`
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const ActionsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.space.lg};
  margin-top: ${({ theme }) => theme.space.lg};
`;

const ActionCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.space.lg};
  transition: transform ${({ theme }) => theme.animations.medium};
`;

const ActionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const ActionDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.space.xs};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space.md};
  background-color: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  outline: none;
  transition: border-color ${({ theme }) => theme.animations.medium};

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.space.md};
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.buttonText};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  transition: background-color ${({ theme }) => theme.animations.medium};

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentDark};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const EstimatedReturn = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.sm};
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: rgba(226, 92, 92, 0.1);
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.space.md};
  text-align: center;
`;

const SuccessMessage = styled.div`
  background-color: rgba(76, 175, 80, 0.1);
  color: ${({ theme }) => theme.colors.success};
  padding: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.space.md};
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default TokenActions;