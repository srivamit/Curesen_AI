#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <MAX30105.h>
#include "heartRate.h"

// Configuration
const char* ssid = "edo_net";
const char* password = "edorer11";
#define MAX30102_SDA 7
#define MAX30102_SCL 9
#define WS_PORT 81
#define WIFI_TIMEOUT 30000  // 30 seconds timeout
#define WIFI_RECONNECT_INTERVAL 5000 // 5 seconds between reconnection attempts

// Global objects
WebSocketsServer webSocket(WS_PORT);
MAX30105 particleSensor;

// Sensor variables
struct SensorData {
  float bpm = 0;
  float spo2 = 0;
} sensorData;

// Enhanced buffer for smoother readings
byte rates[8] = {0}; // Increased buffer size for smoother averaging
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 0;

// Sensor detection threshold (lowered for wrist-based detection)
#define IR_THRESHOLD 5000  // Much lower threshold for wrist-based detection

// Running flag
bool sensorActive = true;

void setup() {
  Serial.begin(115200);
  delay(1000); // Give serial monitor time to start
  
  Serial.println("\nESP32-C3 Wrist-Based Heart Rate & SpO2 Monitor Starting...");
  
  // Initialize components
  initMAX30102();
  initWiFi();
  initWebSocket();
}

void loop() {
  webSocket.loop();
  maintainWiFi();
  
  // Check if sensor needs reinitialization
  static unsigned long lastRecheck = 0;
  if (millis() - lastRecheck > 60000) { // Check sensor every minute
    lastRecheck = millis();
    if (particleSensor.getIR() == 0) {
      Serial.println("Sensor appears inactive, reinitializing...");
      initMAX30102();
    }
  }
  
  readSensorData();
  sendSensorData();
  delay(10);
}

// Hardware initialization with enhanced sensitivity for wrist
void initMAX30102() {
  Serial.println("Initializing MAX30102 sensor with wrist-optimized settings...");
  Wire.begin(MAX30102_SDA, MAX30102_SCL);
  
  // Try multiple times to connect to the sensor
  for (int attempt = 1; attempt <= 5; attempt++) {
    if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
      Serial.println("MAX30102 sensor initialized successfully!");
      
      // Enhanced configuration settings for wrist-based monitoring
      byte ledBrightness = 255; // Maximum LED brightness (0=Off to 255=50mA)
      byte sampleAverage = 8;   // Higher sample averaging for cleaner signal
      byte ledMode = 2;         // Options: 1=Red only, 2=Red+IR, 3=Red+IR+Green
      byte sampleRate = 400;    // Higher sample rate for better detection (50, 100, 200, 400, 800, 1000, 1600, 3200)
      int pulseWidth = 411;     // Maximum pulse width for detection
      int adcRange = 16384;     // Maximum ADC range for best sensitivity
      
      particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
      particleSensor.setPulseAmplitudeRed(0xFF); // Set RED LED to maximum
      particleSensor.setPulseAmplitudeIR(0xFF);  // Set IR LED to maximum
      particleSensor.setPulseAmplitudeGreen(0);  // Turn off Green LED
      
      // Set sensor to continuous conversion mode for constant reading
      particleSensor.enableDIETEMPRDY(); // Enable temp ready interrupt to keep sensor active
      
      // Test if sensor is responding by checking IR values
      if (particleSensor.getIR() == 0) {
        Serial.println("WARNING: MAX30102 sensor returned zero IR value. Check connections!");
      } else {
        Serial.println("MAX30102 sensor is active and returning data!");
        sensorActive = true;
      }
      
      return;
    }
    
    Serial.printf("MAX30102 initialization attempt %d failed. Retrying...\n", attempt);
    delay(1000);
  }
  
  Serial.println("MAX30102 initialization failed after multiple attempts. Continuing without sensor.");
  sensorActive = false;
  // Continue without sensor rather than hanging
}

// Improved WiFi management
void initWiFi() {
  Serial.printf("Connecting to WiFi network: %s\n", ssid);
  
  WiFi.disconnect(true);  // Disconnect from any previous connections
  delay(1000);
  
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  
  WiFi.begin(ssid, password);
  
  unsigned long startAttempt = millis();
  Serial.print("Connecting");
  
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < WIFI_TIMEOUT) {
    Serial.print(".");
    delay(500);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected successfully!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\nFailed to connect to WiFi. Error code: " + String(WiFi.status()));
    Serial.println("The device will continue trying to connect...");
  }
}

void maintainWiFi() {
  static unsigned long lastReconnectAttempt = 0;
  
  if (WiFi.status() != WL_CONNECTED) {
    // Only attempt to reconnect at intervals
    if (millis() - lastReconnectAttempt > WIFI_RECONNECT_INTERVAL) {
      lastReconnectAttempt = millis();
      Serial.println("WiFi disconnected. Attempting to reconnect...");
      
      WiFi.disconnect();
      delay(500);
      WiFi.begin(ssid, password);
      
      // Wait briefly for connection
      unsigned long startAttempt = millis();
      while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 5000) {
        delay(100);
      }
      
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Reconnected to WiFi. IP: " + WiFi.localIP().toString());
      } else {
        Serial.println("Reconnection attempt failed. Will try again later.");
      }
    }
  }
}

// WebSocket management
void initWebSocket() {
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket server started on port " + String(WS_PORT));
}

// Enhanced sensor data handling for wrist-based measurements
void readSensorData() {
  long irValue = particleSensor.getIR();
  
  // Always process data, even with low signals for wrist-based monitoring
  if (irValue > IR_THRESHOLD) {
    // Signal detected - process it
    processHeartRate(irValue);
    processSpO2(irValue);
    
    // Debug output only when signal changes significantly
    static long lastIRValue = 0;
    if (abs(irValue - lastIRValue) > IR_THRESHOLD || millis() % 10000 < 100) {
      Serial.printf("Signal detected! IR value: %ld\n", irValue);
      lastIRValue = irValue;
    }
  } else {
    // Extremely low signal, but still try to process if possible
    // Don't reset values to zero - maintain last reading for continuous output
    if (irValue > 0) {
      // Even with weak signal, try to detect
      processHeartRate(irValue);
      
      // Debug output at intervals
      static unsigned long lastLowDebug = 0;
      if (millis() - lastLowDebug > 10000) {  // Print debug info every 10 seconds
        lastLowDebug = millis();
        Serial.printf("Low signal detected (IR: %ld). Attempting to process.\n", irValue);
      }
    } else {
      // Only report zero readings if IR is actually zero (possible sensor disconnect)
      static unsigned long lastZeroDebug = 0;
      if (millis() - lastZeroDebug > 30000) {  // Print debug info every 30 seconds
        lastZeroDebug = millis();
        Serial.println("WARNING: Zero IR reading detected. Sensor may be disconnected.");
      }
    }
  }
}

// Enhanced heart rate processing for weak signals
void processHeartRate(long irValue) {
  // Apply digital filtering to enhance signal (simple exponential smoothing)
  static long filteredIR = 0;
  filteredIR = (filteredIR * 0.8) + (irValue * 0.2); // 80% previous, 20% new
  
  // Use filtered value for beat detection with higher sensitivity
  if (checkForBeat(filteredIR)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    
    if (delta > 0) {
      beatsPerMinute = 60 / (delta / 1000.0);
      
      // Only print for significant changes
      static float lastReportedBPM = 0;
      if (abs(beatsPerMinute - lastReportedBPM) > 5 || millis() % 5000 < 100) {
        Serial.printf("Beat detected! BPM: %.1f\n", beatsPerMinute);
        lastReportedBPM = beatsPerMinute;
      }

      // More realistic range for human heart rate, but wider for potential weak signals
      if (beatsPerMinute > 30 && beatsPerMinute < 220) {
        // Use larger buffer for more stable readings
        rates[rateSpot++] = (byte)beatsPerMinute;
        rateSpot %= 8; // Use all 8 slots for better averaging

        // Calculate average with weighted recent values
        float sum = 0;
        float weights = 0;
        for (byte x = 0; x < 8; x++) {
          // Give more weight to recent readings
          float weight = 1.0 + (x % 4) * 0.5;
          sum += rates[(rateSpot - 1 - x + 8) % 8] * weight;
          weights += weight;
        }
        
        if (weights > 0) {
          beatAvg = sum / weights;
          
          // Update the global sensor data with smoothing
          // Blend new average with existing value for smoother transitions
          sensorData.bpm = sensorData.bpm * 0.7 + (beatAvg * 0.3);
          sensorData.bpm = constrain(sensorData.bpm, 40, 200);
        }
      }
    }
  }
}

// Improved SpO2 calculation with higher sensitivity
void processSpO2(long irValue) {
  long red = particleSensor.getRed();
  
  // Only debug occasionally to reduce console spam
  static unsigned long lastSpO2Debug = 0;
  if (millis() - lastSpO2Debug > 10000) {  // Print every 10 seconds
    lastSpO2Debug = millis();
    if (red > 0 && irValue > 0) {
      Serial.printf("Red: %ld, IR: %ld, Ratio: %.4f\n", red, irValue, (float)red / (float)irValue);
    }
  }
  
  // Process even with lower signals for wrist-based monitoring
  if (red > 1000 && irValue > 1000) {  // Lower threshold for wrist
    float ratio = (float)red / (float)irValue;
    
    // Apply smoothing to the ratio
    static float filteredRatio = 0;
    filteredRatio = (filteredRatio * 0.9) + (ratio * 0.1); // 90% previous, 10% new
    
    // SpO2 calculation formula - this is approximate and calibrated for wrist
    float newSpO2 = constrain(-45.060 * filteredRatio * filteredRatio + 30.354 * filteredRatio + 94.845, 90, 100);
    
    // Apply smoothing to SpO2 readings
    sensorData.spo2 = (sensorData.spo2 * 0.8) + (newSpO2 * 0.2);
    
    // Only log significant changes
    static float lastReportedSpO2 = 0;
    if (abs(sensorData.spo2 - lastReportedSpO2) > 0.5 || millis() % 10000 < 100) {
      Serial.printf("SpO2 calculated: %.1f%%\n", sensorData.spo2);
      lastReportedSpO2 = sensorData.spo2;
    }
  }
  // Don't set to zero if we don't get readings - maintain last value for stability
}

void sendSensorData() {
  static unsigned long lastSend = 0;
  static long sampleCount = 0;
  
  // Accumulate values for averaging between sends
  static float accBPM = 0;
  static float accSpO2 = 0;
  static long accSamples = 0;
  
  // Accumulate readings
  accBPM += sensorData.bpm;
  accSpO2 += sensorData.spo2;
  accSamples++;
  
  if (millis() - lastSend >= 1000) {
    lastSend = millis();
    sampleCount++;
    
    // Prepare data to send - use accumulated average if we have samples
    float reportBPM = (accSamples > 0) ? (accBPM / accSamples) : sensorData.bpm;
    float reportSpO2 = (accSamples > 0) ? (accSpO2 / accSamples) : sensorData.spo2;
    
    // Reset accumulators
    accBPM = 0;
    accSpO2 = 0;
    accSamples = 0;
    
    StaticJsonDocument<200> doc;
    doc["bpm"] = reportBPM;
    doc["spo2"] = reportSpO2;
    doc["connected"] = (WiFi.status() == WL_CONNECTED);
    doc["rssi"] = WiFi.RSSI();
    doc["ir"] = particleSensor.getIR(); // Add raw IR value
    doc["red"] = particleSensor.getRed(); // Add raw RED value
    doc["uptime"] = millis() / 1000; // Add uptime in seconds
    doc["sensorActive"] = sensorActive;
    
    String json;
    serializeJson(doc, json);
    
    // Only print occasional updates to console to reduce spam
    if (sampleCount % 5 == 0) {
      Serial.print("Sending data: ");
      Serial.println(json);
    }
    
    if (webSocket.connectedClients() > 0) {
      webSocket.broadcastTXT(json);
    } else if (sampleCount % 10 == 0) {
      // Less frequent "no clients" messages
      Serial.println("No WebSocket clients connected");
    }
  }
}

// WebSocket event handler
void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.printf("WebSocket client %u connected from %s\n", num, webSocket.remoteIP(num).toString().c_str());
      break;
    case WStype_DISCONNECTED:
      Serial.printf("WebSocket client %u disconnected\n", num);
      break;
    case WStype_TEXT:
      handleWebSocketMessage(num, payload, length);
      break;
  }
}

void handleWebSocketMessage(uint8_t num, uint8_t *payload, size_t length) {
  String message = "";
  for (size_t i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.printf("Received from client %u: %s\n", num, message.c_str());
  
  // Process commands
  if (message.indexOf("resetSensor") >= 0) {
    Serial.println("Received command to reset sensor");
    initMAX30102();
  } 
  else if (message.indexOf("sensitivity=high") >= 0) {
    // Increase LED brightness for stronger signal
    particleSensor.setPulseAmplitudeRed(0xFF);
    particleSensor.setPulseAmplitudeIR(0xFF);
    Serial.println("Set sensor to high sensitivity mode");
  }
  else if (message.indexOf("sensitivity=medium") >= 0) {
    particleSensor.setPulseAmplitudeRed(0x7F);
    particleSensor.setPulseAmplitudeIR(0x7F);
    Serial.println("Set sensor to medium sensitivity mode");
  }
  else if (message.indexOf("sensitivity=low") >= 0) {
    particleSensor.setPulseAmplitudeRed(0x1F);
    particleSensor.setPulseAmplitudeIR(0x1F);
    Serial.println("Set sensor to low sensitivity mode");
  }
}