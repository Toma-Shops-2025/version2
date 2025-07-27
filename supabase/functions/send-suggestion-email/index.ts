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

    // Send email using EmailJS
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'service_TSsuggestions',
        template_id: 'template_TSsuggestions',
        user_id: '2YEmCiVYT3oyjXb-Z',
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

    if (!emailResponse.ok) {
      console.error('Email sending failed:', await emailResponse.text())
      throw new Error('Failed to send email notification')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Suggestion submitted and email notification sent successfully!' 
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