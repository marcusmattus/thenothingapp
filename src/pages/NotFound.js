import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Content>
        <Title>404</Title>
        <Subtitle>Page Not Found</Subtitle>
        <Description>
          The page you are looking for doesn't exist or has been moved.
        </Description>
        <BackButton to="/signin">
          Back to Sign In
        </BackButton>
      </Content>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.space.md};
`;

const Content = styled.div`
  text-align: center;
  max-width: 500px;
`;

const Title = styled.h1`
  font-size: 6rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.accent};
  line-height: 1;
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.space.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const BackButton = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.lg};
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.buttonText};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  transition: background-color ${({ theme }) => theme.animations.medium};
  text-decoration: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentDark};
  }
`;

export default NotFound;