# TomaShops Chatbot - Alternative to Omakase

## Overview

The TomaShops chatbot (TomaBot) is a modern, AI-powered customer support solution that provides an alternative to Omakase. It's designed to help users with common questions about the marketplace, buying, selling, and general support.

## Features

### 🤖 Smart Responses
- **Context-Aware**: Recognizes user login status and personalizes responses
- **Knowledge Base**: Comprehensive responses for common TomaShops questions
- **Natural Language**: Understands various ways users might ask the same question

### 💬 User Experience
- **Floating Chat Button**: Always accessible from any page
- **Quick Replies**: Pre-defined common questions for easy interaction
- **Real-time Typing**: Shows when the bot is "thinking"
- **Message History**: Maintains conversation context
- **Responsive Design**: Works on desktop and mobile

### 🎨 Modern UI
- **Shadcn/UI Components**: Consistent with your existing design system
- **Smooth Animations**: Professional feel with CSS transitions
- **Dark/Light Theme**: Automatically adapts to your theme
- **Accessibility**: Keyboard navigation and screen reader friendly

## Key Capabilities

### Buying & Selling
- How to sell items on TomaShops
- How to buy items safely
- Account management
- Listing optimization tips

### Safety & Security
- Safety guidelines
- Meeting recommendations
- Fraud prevention tips
- Secure payment methods

### Platform Features
- Category explanations
- Shipping and delivery options
- Rental services
- Job listings
- Digital products

### Support
- Contact information
- FAQ assistance
- Account help
- Technical support

## Technical Implementation

### Components
- `Chatbot.tsx`: Main chatbot component
- `chatbotService.ts`: Response generation and logic
- Integrated with `AppContext.tsx` for user state

### Dependencies
- React 18+ with TypeScript
- Shadcn/UI components
- Lucide React icons
- Tailwind CSS for styling

### Architecture
```
src/
├── components/
│   └── Chatbot.tsx          # Main chatbot component
├── lib/
│   └── chatbotService.ts    # Response logic and knowledge base
└── contexts/
    └── AppContext.tsx       # User state integration
```

## Usage

### For Users
1. Click the chat button (bottom-right corner)
2. Type your question or use quick replies
3. Get instant, helpful responses
4. Continue the conversation naturally

### For Developers
The chatbot is automatically included in your app via `App.tsx`:

```tsx
import Chatbot from './components/Chatbot';

// In your App component
<Chatbot />
```

## Customization

### Adding New Responses
Edit `src/lib/chatbotService.ts` to add new knowledge base entries:

```typescript
const KNOWLEDGE_BASE = {
  new_topic: {
    keywords: ['keyword1', 'keyword2'],
    response: "Your response here",
    suggestions: ['Suggestion 1', 'Suggestion 2']
  }
};
```

### Styling
The chatbot uses Tailwind CSS classes and can be customized by modifying the component styles in `Chatbot.tsx`.

### Integration with External AI
The service is designed to easily integrate with external AI APIs. Simply modify the `generateResponse` function in `chatbotService.ts`.

## Benefits Over Omakase

1. **No External Dependencies**: Self-hosted solution
2. **Custom Branding**: Matches your TomaShops design
3. **Platform-Specific**: Tailored responses for your marketplace
4. **Cost-Effective**: No monthly subscription fees
5. **Full Control**: Complete customization and data ownership
6. **Better Integration**: Seamless with your existing app

## Future Enhancements

- [ ] Integration with OpenAI API for more advanced responses
- [ ] Conversation history persistence
- [ ] File/image sharing capabilities
- [ ] Multi-language support
- [ ] Analytics and insights
- [ ] Admin dashboard for managing responses

## Support

For technical support or customization requests, refer to the main TomaShops documentation or contact the development team. 