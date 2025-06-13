import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './contexts/ThemeContext';
import { websocketService } from './services/websocketService';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SensorDashboard from './components/SensorDashboard';
import Report from './pages/Report';
import DocChat from './components/DocChat';

import './styles/globals.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState({
    bpm: null,
    spo2: null
  });

  useEffect(() => {
    websocketService.setOnConnectionChange((connected) => {
      setIsConnected(connected);
      if (connected) {
        toast.success('Connected to device');
      }
    });
    
    websocketService.setOnDataCallback((data) => {
      setSensorData(data);
    });
    
    const initialConnect = setTimeout(() => {
      websocketService.connect();
    }, 20000);

    return () => {
      clearTimeout(initialConnect);
      websocketService.disconnect();
    };
  }, []);

  const handleConnect = () => {
    websocketService.connect();
    toast.info('Attempting to connect...');
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app">
          <Header 
            onConnect={handleConnect} 
            isConnected={isConnected}
            onRefresh={handleConnect}
          />
          
          <Routes>
            <Route path="/" element={<SensorDashboard sensorData={sensorData} />} />
            <Route path="/report" element={<Report sensorData={sensorData} />} />
            <Route path="/chat" element={<DocChat sensorData={sensorData} />} />
          </Routes>
          
          <BottomNav />
          <ToastContainer position="top-center" theme="colored" />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
