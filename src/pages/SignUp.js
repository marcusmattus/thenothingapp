import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

// Nothing logo animation
const nothingVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

const circleVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1, 
    transition: { 
      duration: 1.5, 
      ease: "easeInOut",
    }
  }
};

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp, connectWallet, error } = useAuth();
  const navigate = useNavigate();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!email || !password || !confirmPassword) {
      setValidationError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setValidationError('');
      await signUp(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      setIsSubmitting(true);
      await connectWallet();
      navigate('/dashboard');
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <LogoContainer 
        as={motion.div} 
        variants={itemVariants}
      >
        <NothingLogo
          as={motion.svg}
          width="120"
          height="120"
          viewBox="0 0 120 120"
          variants={nothingVariants}
          initial="hidden"
          animate={["visible", "pulse"]}
        >
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            stroke="#8A2BE2"
            strokeWidth="2"
            fill="transparent"
            variants={circleVariants}
          />
          <motion.path
            d="M40,60 L80,60 M60,40 L60,80"
            stroke="#8A2BE2"
            strokeWidth="2"
            strokeLinecap="round"
            variants={circleVariants}
          />
        </NothingLogo>
        <Title as={motion.h1} variants={itemVariants}>The Nothing App</Title>
        <Subtitle as={motion.p} variants={itemVariants}>Start from nothing, build something together</Subtitle>
      </LogoContainer>

      <FormContainer as={motion.div} variants={itemVariants}>
        <Form onSubmit={handleEmailSignUp}>
          <FormTitle>Sign Up</FormTitle>
          
          {(error || validationError) && (
            <ErrorMessage>{error || validationError}</ErrorMessage>
          )}
          
          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </InputGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <Divider>
            <DividerLine />
            <DividerText>or</DividerText>
            <DividerLine />
          </Divider>
          
          <WalletButton type="button" onClick={handleWalletConnect} disabled={isSubmitting}>
            Connect Wallet
          </WalletButton>
          
          <SignInText>
            Already have an account? <Link to="/signin">Sign In</Link>
          </SignInText>
        </Form>
      </FormContainer>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.space.md};
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const NothingLogo = styled.svg`
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.space.xs};
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
`;

const Form = styled.form`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.space.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.space.lg};
  text-align: center;
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
  width: 100%;
  padding: ${({ theme }) => theme.space.md};
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.buttonText};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  transition: background-color ${({ theme }) => theme.animations.medium};
  margin-top: ${({ theme }) => theme.space.md};

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentDark};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const WalletButton = styled(Button)`
  background-color: transparent;
  border: 2px solid ${({ theme }) => theme.colors.accent};
  
  &:hover {
    background-color: rgba(138, 43, 226, 0.1);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.space.lg} 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
`;

const DividerText = styled.span`
  padding: 0 ${({ theme }) => theme.space.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const SignInText = styled.p`
  text-align: center;
  margin-top: ${({ theme }) => theme.space.lg};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    transition: color ${({ theme }) => theme.animations.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.accentDark};
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(226, 92, 92, 0.1);
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.space.md};
  text-align: center;
`;

export default SignUp;