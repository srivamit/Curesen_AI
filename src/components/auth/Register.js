import React, { useState } from 'react';
import styled from '@emotion/styled';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

// ... use same styled components as Login.js ...

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <Title>Create Account</Title>
        <form onSubmit={handleRegister}>
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
          <InputGroup>
            <Icon><FiLock /></Icon>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </InputGroup>
          <Button type="submit" disabled={loading}>
            <FiUserPlus /> {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
        <LinkText>
          Already have an account? <a href="/login">Login</a>
        </LinkText>
      </AuthCard>
    </AuthContainer>
  );
};

export default Register;