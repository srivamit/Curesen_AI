import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { FiSend, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  background-color: var(--bg-secondary);
  border-radius: 12px;
  margin: 70px 16px 70px 16px;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 16px;
  background-color: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InfoButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Message = styled.div`
  padding: 12px;
  border-radius: 8px;
  max-width: 80%;
  ${props => props.isUser ? `
    background-color: var(--accent-color);
    color: white;
    align-self: flex-end;
  ` : `
    background-color: var(--bg-primary);
    color: var(--text-primary);
    align-self: flex-start;
  `}
`;

const AlertMessage = styled(Message)`
  background-color: var(--danger-color);
  color: white;
  align-self: center;
  text-align: center;
`;

const InputContainer = styled.form`
  display: flex;
  gap: 8px;
  padding: 16px;
  background-color: var(--bg-primary);
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const SendButton = styled.button`
  padding: 12px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ChatComponent = ({ sensorData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const alarmSound = new Audio('/alarm.mp3'); // Add your alarm sound file

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check vital signs
    if (sensorData) {
      if (sensorData.bpm < 50) {
        addAlert('Critical Alert: Low Heart Rate detected!');
        playAlarm();
      }
      if (sensorData.spo2 < 88) {
        addAlert('Critical Alert: Low Oxygen Saturation!');
        playAlarm();
      }
      if (sensorData.temp < 31) {
        addAlert('Critical Alert: Low Body Temperature!');
        playAlarm();
      }
    }
  }, [sensorData]);

  const playAlarm = () => {
    if (!alarmPlaying) {
      setAlarmPlaying(true);
      alarmSound.loop = true;
      alarmSound.play();
    }
  };

  const stopAlarm = () => {
    setAlarmPlaying(false);
    alarmSound.pause();
    alarmSound.currentTime = 0;
  };

  const addAlert = (message) => {
    setMessages(prev => [...prev, { text: message, type: 'alert', timestamp: Date.now() }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, type: 'user', timestamp: Date.now() }]);
    
    try {
      // Get AI response using Gemini
      const response = await geminiService.chat(input, sensorData);
      
      setMessages(prev => [...prev, { text: response, type: 'ai', timestamp: Date.now() }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
    }
    
    setInput('');
  };

  const showInstructions = () => {
    toast.info(
      'Chat Instructions:\n\n' +
      '1. Type your health-related questions\n' +
      '2. The AI will respond based on your vital signs\n' +
      '3. Emergency alerts appear automatically\n' +
      '4. Click alerts to dismiss alarms',
      { autoClose: 10000 }
    );
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h2>AI Health Assistant</h2>
        <InfoButton onClick={showInstructions}>
          <FiInfo size={20} />
        </InfoButton>
      </ChatHeader>
      
      <MessagesContainer>
        {messages.map((msg, index) => (
          msg.type === 'alert' ? (
            <AlertMessage key={index} onClick={stopAlarm}>
              {msg.text}
            </AlertMessage>
          ) : (
            <Message key={index} isUser={msg.type === 'user'}>
              {msg.text}
            </Message>
          )
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer onSubmit={handleSubmit}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <SendButton type="submit">
          <FiSend />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatComponent;