import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(event, context) {
  try {
    const { recipientUserId, title, message } = JSON.parse(event.body);

    // Fetch the recipient's FCM token from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('fcm_token')
      .eq('id', recipientUserId)
      .single();

    if (error || !data || !data.fcm_token) throw new Error('Could not fetch FCM token');
    const fcmToken = data.fcm_token;

    // Read the service account JSON from file
    const serviceAccountPath = path.join(__dirname, 'service-account.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    // Authenticate with Google APIs
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/firebase.messaging'],
      null
    );

    await jwtClient.authorize();
    const accessToken = jwtClient.credentials.access_token;

    // Get your Firebase project ID from the service account JSON
    const projectId = serviceAccount.project_id;

    // Dynamically import node-fetch for ESM compatibility
    const fetch = (await import('node-fetch')).default;

    // Send the push notification using FCM HTTP v1
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: title,
            body: message
          },
          data: {
            title: title,
            body: message
          }
        }
      })
    });

    const dataResp = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(dataResp)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
} 