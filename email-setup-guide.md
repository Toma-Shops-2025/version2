# Email Notification Setup Guide

## Option 1: EmailJS (Recommended - Free Tier Available)

1. **Sign up at [EmailJS](https://www.emailjs.com/)**
2. **Create an email service** (Gmail, Outlook, etc.)
3. **Create an email template** with variables:
   - `{{to_email}}` - tomashopsinfo@gmail.com
   - `{{from_name}}` - User's name
   - `{{from_email}}` - User's email
   - `{{category}}` - Suggestion category
   - `{{suggestion}}` - The suggestion text
   - `{{submitted_date}}` - Submission date

4. **Get your credentials:**
   - Service ID
   - Template ID
   - User ID

5. **Update the edge function** in `supabase/functions/send-suggestion-email/index.ts`:
   - Replace `YOUR_EMAILJS_SERVICE_ID` with your service ID
   - Replace `YOUR_EMAILJS_TEMPLATE_ID` with your template ID
   - Replace `YOUR_EMAILJS_USER_ID` with your user ID
   - Uncomment the EmailJS code

## Option 2: SendGrid (Free Tier Available)

1. **Sign up at [SendGrid](https://sendgrid.com/)**
2. **Create an API key**
3. **Update the edge function** to use SendGrid API

## Option 3: Mailgun (Free Tier Available)

1. **Sign up at [Mailgun](https://www.mailgun.com/)**
2. **Create an API key**
3. **Update the edge function** to use Mailgun API

## Option 4: Resend (Developer-Friendly)

1. **Sign up at [Resend](https://resend.com/)**
2. **Create an API key**
3. **Update the edge function** to use Resend API

## Database Trigger Setup

1. **Run the trigger SQL** in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the content from create-suggestion-trigger.sql
   ```

2. **Replace `YOUR_SUPABASE_ANON_KEY`** with your actual anon key:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmaG5zbGFwcnhvd2R4dnlocGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDQzOTcsImV4cCI6MjA2Njg4MDM5N30._zRZW21nqWFFmYO9_BmAghUz05V2-m6jKKaILeaV-MA
   ```

## Deploy Edge Function

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Deploy the function:**
   ```bash
   supabase functions deploy send-suggestion-email
   ```

## Testing

1. **Submit a test suggestion** through your website
2. **Check your email** at tomashopsinfo@gmail.com
3. **Check Supabase logs** for any errors

## Current Status

- ✅ Database table created
- ✅ Suggestion form working
- ✅ Edge function created (needs email service setup)
- ✅ Database trigger created (needs deployment)
- ⏳ Email service integration (choose one of the options above) 