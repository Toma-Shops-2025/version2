importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAzWbvEVl11gyBPvpnBGPYY90sytMUbCJA',
  authDomain: 'toma-shops.firebaseapp.com',
  projectId: 'toma-shops',
  storageBucket: 'toma-shops.appspot.com',
  messagingSenderId: '450492018542',
  appId: '1:450492018542:web:24d437651ac8e719dc9b7f',
  measurementId: 'G-R7ZBY8GXK3'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/tomashops-favicon-v2.png'
  });
}); 