const GEMINI_API_KEY = 'Your_API_Key';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const geminiService = {
  async generateReport(sensorData) {
    const prompt = `Generate a concise 120-word medical report based on these vital signs (keep in mind if the temperature is nearly 32 or 31 then present it as normal temperature, also when SpO2 is more than 95% and temperature is nearly 32 then tell in report that the user health is good):
      Heart Rate: ${sensorData.bpm} BPM
      SpO2: ${sensorData.spo2}%
      Temperature: ${sensorData.temp}°C`;

    try {
      const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Report generation error:', error);
      return 'Unable to generate report at this time.';
    }
  },

  async getChatResponse(message, chatHistory) {
    // Get vital signs from the stored report instead of live data
    let reportData = { bpm: 0, spo2: 0, temp: 0 };
    
    try {
      const savedReport = localStorage.getItem('latestReport');
      if (savedReport) {
        const parsedReport = JSON.parse(savedReport);
        reportData = parsedReport.vitals;
      }
    } catch (error) {
      console.error('Error retrieving report data:', error);
    }
    
    const context = `Current vital signs from latest report - HR: ${reportData.bpm} BPM, SpO2: ${reportData.spo2}%, Temp: ${reportData.temp}°C. 
                     Previous chat context: ${chatHistory}. 
                     Respond in 30 words or less.`;

    try {
      const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${context}\n\nUser: ${message}` }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Chat response error:', error);
      return 'I apologize, but I cannot respond at this moment.';
    }
  }
};