import React, { useState, useEffect } from 'react';
import { websocketService } from '../services/websocketService';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const scaleIn = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const ConfigContainer = styled.div`
  background-color: var(--bg-secondary);
  border: #f6f8fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 120px;
`;

const Title = styled.h3`
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const EditButton = styled(Button)`
  background-color: var(--accent-color);
`;

const SaveButton = styled(Button)`
  background-color: var(--success-color);
`;

const CancelButton = styled(Button)`
  background-color: var(--danger-color);
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  min-width: 200px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(40, 167, 69, 0.2);
  border-top: 4px solid var(--success-color);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const SuccessIcon = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid var(--success-color);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ${scaleIn} 0.5s ease-out;
  
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 8px;
    height: 16px;
    border-right: 4px solid var(--success-color);
    border-bottom: 4px solid var(--success-color);
  }
`;

const ContentWrapper = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.3s ease-out;
`;

const IPConfig = () => {
  const [ipAddress, setIpAddress] = useState(websocketService.getEsp32IP());
  const [isEditing, setIsEditing] = useState(false);
  const [tempIP, setTempIP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);

  useEffect(() => {
    setIpAddress(websocketService.getEsp32IP());
  }, []);

  const handleEdit = () => {
    setTempIP(ipAddress);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (tempIP) {
      setIsContentVisible(false);
      setIsLoading(true);
      
      // Simulate loading for 1.5 seconds
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccess(true);
        
        // Show success for 1 second
        setTimeout(() => {
          setShowSuccess(false);
          setIsContentVisible(true);
          websocketService.setEsp32IP(tempIP);
          setIpAddress(tempIP);
          setIsEditing(false);
        }, 1000);
      }, 1500);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <ConfigContainer>
      <Title>Aid-Band IP Configuration</Title>
      {isLoading && <LoadingSpinner />}
      {showSuccess && <SuccessIcon />}
      <ContentWrapper isVisible={isContentVisible}>
        {!isEditing ? (
          <ButtonGroup>
            <span style={{ color: 'var(--text-primary)' }}>Current IP: {ipAddress}</span>
            <EditButton onClick={handleEdit}>
              Edit IP
            </EditButton>
          </ButtonGroup>
        ) : (
          <ButtonGroup>
            <Input
              type="text"
              value={tempIP}
              onChange={(e) => setTempIP(e.target.value)}
              placeholder="Enter new IP address"
            />
            <SaveButton onClick={handleSave}>
              Save
            </SaveButton>
            <CancelButton onClick={handleCancel}>
              Cancel
            </CancelButton>
          </ButtonGroup>
        )}
      </ContentWrapper>
    </ConfigContainer>
  );
};

export default IPConfig; 