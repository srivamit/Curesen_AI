import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { FiHome, FiFileText, FiMessageSquare } from 'react-icons/fi';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
`;

const NavLink = styled(Link)`
  color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-secondary)'};
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
`;

const BottomNav = () => {
  const location = useLocation();

  return (
    <NavContainer>
      <NavLink to="/" active={location.pathname === '/'}>
        <FiHome size={20} />
        Home
      </NavLink>
      <NavLink to="/report" active={location.pathname === '/report'}>
        <FiFileText size={20} />
        Report
      </NavLink>
      <NavLink to="/chat" active={location.pathname === '/chat'}>
        <FiMessageSquare size={20} />
        Chat
      </NavLink>
    </NavContainer>
  );
};

export default BottomNav;