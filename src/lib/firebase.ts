import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAzWbvEVl11gyBPvpnBGPYY90sytMUbCJA",
  authDomain: "toma-shops.firebaseapp.com",
  projectId: "toma-shops",
  storageBucket: "toma-shops.appspot.com",
  messagingSenderId: "450492018542",
  appId: "1:450492018542:web:24d437651ac8e719dc9b7f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage }; 