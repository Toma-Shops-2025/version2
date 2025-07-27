import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the suggestion data from the request
    const { suggestion } = await req.json()
    
    if (!suggestion) {
      throw new Error('No suggestion data provided')
    }

    // Create email content
    const emailContent = `
New Suggestion Submitted on TomaShops

Name: ${suggestion.name}
Email: ${suggestion.email}
Category: ${suggestion.category}
Status: ${suggestion.status}

Suggestion:
${suggestion.suggestion}

Submitted: ${new Date(suggestion.created_at).toLocaleString()}

---
This email was sent automatically from the TomaShops Suggestion Box.
    `.trim()

    // For now, we'll log the email content and you can set up email forwarding
    // You can replace this with your preferred email service
    console.log('=== SUGGESTION EMAIL ===')
    console.log(emailContent)
    console.log('=== END SUGGESTION EMAIL ===')

    // TODO: Replace with your preferred email service
    // Options:
    // 1. EmailJS (free tier available)
    // 2. SendGrid (free tier available)
    // 3. Mailgun (free tier available)
    // 4. Resend (developer-friendly)
    
    // Example with EmailJS (you'll need to set this up):
    /*
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'YOUR_EMAILJS_SERVICE_ID',
        template_id: 'YOUR_EMAILJS_TEMPLATE_ID',
        user_id: 'YOUR_EMAILJS_USER_ID',
        template_params: {
          to_email: 'tomashopsinfo@gmail.com',
          from_name: suggestion.name,
          from_email: suggestion.email,
          category: suggestion.category,
          suggestion: suggestion.suggestion,
          submitted_date: new Date(suggestion.created_at).toLocaleString(),
        }
      })
    })
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Suggestion submitted successfully. Email notification logged.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-suggestion-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}) 