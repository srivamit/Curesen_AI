import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCxTPwlZs8489rnXhH60JpRPe47MENWXjI",
  authDomain: "curesenai.firebaseapp.com",
  projectId: "curesenai",
  storageBucket: "curesenai.firebasestorage.app",
  messagingSenderId: "840679850477",
  appId: "1:840679850477:web:d87bad4e8e1666f402a7e4",
  measurementId: "G-THDYERXL7X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, auth, analytics, messaging };