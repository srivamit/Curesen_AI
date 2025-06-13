class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.onDataCallback = null;
    this.onConnectionChange = null;
    this.esp32IP = localStorage.getItem('esp32IP') || '192.168.42.78'; // Default IP with fallback
  }

  connect() {
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(`ws://${this.esp32IP}:81`);

      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.isConnected = true;
        if (this.onConnectionChange) {
          this.onConnectionChange(true);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received sensor data:', data);
          
          if (data && typeof data.bpm === 'number' && typeof data.spo2 === 'number' && typeof data.temp === 'number') {
            // Validate and process the data
            const processedData = {
              temp: data.temp>0? data.temp : 0,
              bpm: data.bpm > 0 ? data.bpm : 0,
              spo2: data.spo2 > 0 ? data.spo2 : 0
            };
            
            if (this.onDataCallback) {
              this.onDataCallback(processedData);
            }
          }
        } catch (error) {
          console.error('WebSocket data parse error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket Disconnected');
        this.isConnected = false;
        if (this.onConnectionChange) {
          this.onConnectionChange(false);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  setOnDataCallback(callback) {
    this.onDataCallback = callback;
  }

  setOnConnectionChange(callback) {
    this.onConnectionChange = callback;
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  setEsp32IP(newIP) {
    this.esp32IP = newIP;
    localStorage.setItem('esp32IP', newIP);
    // Reconnect with new IP if currently connected
    if (this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }

  getEsp32IP() {
    return this.esp32IP;
  }
}

export const websocketService = new WebSocketService();