import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import styled from '@emotion/styled';
import { FiSend } from 'react-icons/fi';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
  margin-top: 70px;
  padding: 16px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: var(--accent-color);
    color: white;
  ` : `
    align-self: flex-start;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
  `}
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
`;

const SendButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DocChat = ({ sensorData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [finalData, setFinalData] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      handleInitialMessage();
    }
  }, []);

  const handleInitialMessage = async () => {
    const response = await geminiService.getChatResponse(
      "Hello, I'm here to help. What symptoms are you experiencing?",
      sensorData,
      ""
    );
    setMessages([{ text: response, isUser: false }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, isUser: true }];
    setMessages(newMessages);
    setInput('');

    const chatHistory = messages
      .map(m => `${m.isUser ? 'User' : 'AI'}: ${m.text}`)
      .join('\n');

    const response = await geminiService.getChatResponse(
      input,
      sensorData,
      chatHistory
    );

    setMessages([...newMessages, { text: response, isUser: false }]);
    setQuestionCount(prev => prev + 1);

    if (questionCount >= 5) {
      setTimeout(async () => {
        const finalVerdict = await geminiService.getChatResponse(
          "Provide final assessment",
          sensorData,
          chatHistory
        );
        setMessages(prev => [...prev, { text: finalVerdict, isUser: false }]);
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, idx) => (
          <Message key={idx} isUser={msg.isUser}>
            {msg.text}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <SendButton onClick={handleSend}>
          <FiSend />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default DocChat;