import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { FiHeart, FiDroplet, FiThermometer } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { geminiService } from '../services/geminiService';
import IPConfig from './IPConfig';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  margin-top: 70px;
`;

const MetricCard = styled.div`
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:first-of-type {
    grid-column: 1 / -1;
  }
`;

const MetricValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: var(--accent-color);
  margin: 8px 0;
`;

const MetricLabel = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
`;

const SensorDashboard = ({ sensorData }) => {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [measurementStartTime, setMeasurementStartTime] = useState(null);
  const [notificationShown, setNotificationShown] = useState(false);

  const generateReport = async (data) => {
    try {
      const report = await geminiService.generateReport({
        bpm: Math.round(data.bpm),
        spo2: Math.round(data.spo2),
        temp: data.temp ? Number(data.temp.toFixed(1)) : 0
      });
      
      if (report) {
        setReportGenerated(true);
        
        // Only show notification if not already shown
        if (!notificationShown) {
          toast.info('Health report generated! Check the Report tab.', {
            style: { background: '#ff9800', color: 'white' },
            toastId: 'report-generated', // Prevents duplicate toasts
            autoClose: 5000 // Close after 5 seconds
          });
          setNotificationShown(true);
        }
        
        localStorage.setItem('latestReport', JSON.stringify({
          report,
          vitals: data,
          timestamp: Date.now(),
          active: "true"
        }));
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Failed to generate report. Please try again.', {
        toastId: 'report-error' // Prevents duplicate error toasts
      });
    }
  };

  useEffect(() => {
    // Start timer when valid data is received
    if (sensorData.bpm > 0 && sensorData.spo2 > 0 && !measurementStartTime) {
      setMeasurementStartTime(Date.now());
    }

    // Generate report after 20 seconds of valid measurements
    if (measurementStartTime && !reportGenerated) {
      const elapsedTime = Date.now() - measurementStartTime;
      if (elapsedTime >= 20000) {
        generateReport(sensorData);
      }
    }
  }, [sensorData, measurementStartTime, reportGenerated, generateReport]);

  return (
    <>
      <DashboardGrid>
        <MetricCard>
          <FiHeart size={24} color="var(--danger-color)" />
          <MetricValue>{sensorData.bpm > 0 ? Math.round(sensorData.bpm) : '--'}</MetricValue>
          <MetricLabel>Heart Rate (BPM)</MetricLabel>
        </MetricCard>
        
        <MetricCard>
          <FiDroplet size={24} color="var(--accent-color)" />
          <MetricValue>{sensorData.spo2 > 0 ? Math.round(sensorData.spo2) : '--'}%</MetricValue>
          <MetricLabel>SpO2</MetricLabel>
        </MetricCard>
        
        <MetricCard>
          <FiThermometer size={24} color="var(--success-color)" />
          <MetricValue>
            {sensorData.temp > 0 ? Number(sensorData.temp.toFixed(1)) : '--'}°C
          </MetricValue>
          <MetricLabel>Temperature</MetricLabel>
        </MetricCard>
      </DashboardGrid>
      <IPConfig />
    </>
  );
};

export default SensorDashboard;