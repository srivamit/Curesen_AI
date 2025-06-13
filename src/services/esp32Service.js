import axios from 'axios';

class ESP32Service {
  constructor() {
    this.baseURL = 'http://192.168.93.78';
    this.isConnecting = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    
    // Configure axios defaults
    axios.defaults.headers.common['Accept'] = '*/*';
    axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    axios.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  }

  async connect() {
    if (this.isConnecting) return false;
    this.isConnecting = true;
    this.retryCount = 0;

    try {
      const response = await axios({
        method: 'get',
        url: `${this.baseURL}/connect`,
        timeout: 5000,
        headers: {
          'Accept': '*/*',
          'Content-Type': 'text/plain',
        },
        withCredentials: false
      });
      
      console.log('Connection response:', response);
      return response.status === 200;
    } catch (error) {
      console.error('Connection error details:', {
        message: error.message,
        response: error.response,
        config: error.config
      });
      return this.handleReconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  async getSensorData() {
    try {
      const response = await axios({
        method: 'get',
        url: `${this.baseURL}/data`,
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });
      
      const data = response.data;
      
      if (!this.isValidData(data)) {
        throw new Error('Invalid data format received');
      }
      
      return data;
    } catch (error) {
      console.error('Data fetch error details:', {
        message: error.message,
        response: error.response,
        config: error.config
      });
      return null;
    }
  }

  async handleReconnect() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying connection (${this.retryCount}/${this.maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.connect();
    }
    return false;
  }

  isValidData(data) {
    return data && 
           typeof data.bpm === 'number' && 
           typeof data.spo2 === 'number' && 
           typeof data.temp === 'number';
  }
}

export const esp32Service = new ESP32Service();