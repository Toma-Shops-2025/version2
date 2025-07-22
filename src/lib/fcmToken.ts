// import { messaging, getToken } from './firebase';

// export async function requestFirebaseNotificationPermission() {
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission === 'granted') {
//       const currentToken = await getToken(messaging, {
//         vapidKey: 'BE3IDJZ1pD4CfPc3XqVWjU93DP0ph4hQGyfvLpBQzuuNo_msd5p67cteHgPzMmGJrdQ9FyAx-vbU0vA01GMIi8Y'
//       });
//       if (currentToken) {
//         // Save this token to your DB (Supabase) for the user
//         return currentToken;
//       }
//     }
//   } catch (err) {
//     console.error('FCM error:', err);
//   }
//   return null;
// }

// FCM disabled for now to avoid service worker issues
export async function requestFirebaseNotificationPermission() {
  return null;
} 