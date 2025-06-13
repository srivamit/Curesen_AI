# Curesen AI - Your Med Companion

Curesen AI is an innovative health monitoring system that combines real-time sensor data from ESP32-C3 with advanced AI capabilities to provide comprehensive health insights and personalized medical guidance.

## 🌟 Key Features

### Real-time Health Monitoring
- Vital Signs Tracking : Monitor heart rate (BPM), blood oxygen levels (SpO2), and body temperature in real-time
- Wireless Connectivity : Seamless integration with ESP32-C3 via WiFi for reliable data transmission
- Responsive Dashboard : User-friendly interface displaying real-time health metrics

### AI-Powered Health Analysis
- Automated Health Reports : Generation of detailed health reports using Google's Generative AI
- Smart Health Assessment : Analysis of vital signs to provide health insights
- AI Doctor Chat : Interactive chat interface with an AI-powered medical assistant for immediate health guidance

## 🛠️ Technical Stack

### Frontend
- Framework : React.js
- Styling : Emotion (Styled Components)
- State Management : React Context API
- Routing : React Router
- UI Components : Custom components with React Icons

### Backend & Integration
- Real-time Communication : WebSocket for ESP32-C3 data streaming
- AI Integration : Google Generative AI for health analysis
- Cross-Platform : Capacitor for mobile deployment

## 📱 Platform Support

### Web Application
- Modern browsers (Chrome, Firefox, Safari, Edge)

### Mobile Apps
- Android 5.0+ (Lollipop)
- iOS 11.0+

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository
```bash
git clone https://github.com/srivamit/Curesen_AI
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

### Mobile Development

#### Android
```bash
npx cap add android
npm run build
npx cap copy android
npx cap open android
```

#### iOS
```bash
npx cap add ios
npm run build
npx cap copy ios
npx cap open ios
```

## 🔧 Configuration

### ESP32-C3 Connection
1. Navigate to the IP Configuration section in the app
2. Enter your ESP32-C3's IP address
3. Save the configuration

## 📖 Usage
1. Connect Device : Use the WiFi icon in the header to connect to your ESP32-C3 device
2. Monitor Vitals : View real-time health metrics on the dashboard
3. Generate Reports : Reports are automatically generated after 20 seconds of valid measurements
4. AI Chat : Access the AI doctor chat for health-related queries and guidance

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- ESP32-C3 for reliable sensor data transmission
- Google Generative AI for powerful health analysis
- React community for excellent development tools

Made By Amit Srivastav :octocat:
