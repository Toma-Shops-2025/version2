const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async function(event, context) {
  try {
    const { recipientUserId, title, message } = JSON.parse(event.body);

    // Fetch the recipient's OneSignal player IDs from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('onesignal_player_ids')
      .eq('id', recipientUserId)
      .single();

    if (error || !data) throw new Error('Could not fetch player IDs');
    const playerIds = data.onesignal_player_ids || [];

    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: message },
        include_player_ids: playerIds
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
}; 