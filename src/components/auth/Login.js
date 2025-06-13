import React, { useState } from 'react';
import styled from '@emotion/styled';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--bg-primary);
`;

const AuthCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: var(--accent-color);
  text-align: center;
  margin-bottom: 24px;
  font-size: 24px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const Icon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 16px;
  color: var(--text-secondary);
  
  a {
    color: var(--accent-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <Title>Welcome to Curesen AI</Title>
        <form onSubmit={handleLogin}>
          <InputGroup>
            <Icon><FiMail /></Icon>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Icon><FiLock /></Icon>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          <Button type="submit" disabled={loading}>
            <FiLogIn /> {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <LinkText>
          Don't have an account? <a href="/register">Register</a>
        </LinkText>
      </AuthCard>
    </AuthContainer>
  );
};

export default Login;