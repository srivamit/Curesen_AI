import React from 'react';
import { FiWifi, FiMoon, FiSun, FiRefreshCw } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import styled from '@emotion/styled';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1000;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  
  &:hover {
    background-color: var(--bg-primary);
  }
`;

const Header = ({ onConnect, isConnected, onRefresh }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <HeaderContainer>
      <Logo>Curesen AI</Logo>
      <ButtonGroup>
        <IconButton onClick={onConnect}>
          <FiWifi color={isConnected ? 'var(--success-color)' : 'var(--danger-color)'} />
        </IconButton>
        <IconButton onClick={onRefresh}>
          <FiRefreshCw />
        </IconButton>
        <IconButton onClick={toggleTheme}>
          {isDark ? <FiSun /> : <FiMoon />}
        </IconButton>
      </ButtonGroup>
    </HeaderContainer>
  );
};

export default Header;