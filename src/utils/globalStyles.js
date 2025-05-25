import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    font-family: ${({ theme }) => theme.fonts.body};
    cursor: pointer;
    border: none;
    outline: none;
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.accent};
  }

  input, textarea, select {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 16px;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    margin: 0;
  }
`;

export default GlobalStyle;