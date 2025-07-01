# TomaShops Video 1st Marketplace

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase and OneSignal credentials:
     ```sh
     cp .env.example .env
     ```
   - Required variables:
     - `VITE_SUPABASE_URL` (from your Supabase project)
     - `VITE_SUPABASE_ANON_KEY` (from your Supabase project)
     - `VITE_ONESIGNAL_APP_ID` (from your OneSignal dashboard, optional)
     - `VITE_ONESIGNAL_SAFARI_WEB_ID` (from OneSignal, optional)

4. **Run the app locally:**
   ```sh
   npm run dev
   ```
   - Visit [http://localhost:8080](http://localhost:8080) in your browser.

## Deploying to Netlify

1. **Push your code to GitHub, GitLab, or Bitbucket.**
2. **Go to [Netlify](https://netlify.com/) and create a new site from Git.**
3. **Set the build command and publish directory:**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Add environment variables in Netlify:**
   - Go to Site Settings > Environment Variables
   - Add the same variables as in your `.env` file:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_ONESIGNAL_APP_ID` (optional)
     - `VITE_ONESIGNAL_SAFARI_WEB_ID` (optional)
5. **Deploy!**
   - Netlify will build and deploy your site over HTTPS.

## For Buyers and Sellers
- **Buyers:** Browse, search, and message sellers. Make offers on listings.
- **Sellers:** Create listings (video required, up to 10 photos), manage offers, and chat with buyers.
- **Messaging:** Real-time chat, typing indicators, unread badges.
- **Push Notifications:** (Optional) Enable in your browser for instant updates.

## Support
- If you have issues or questions, open an issue or contact the TomaShops team.
