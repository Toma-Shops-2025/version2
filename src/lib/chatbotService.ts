// Chatbot service for handling AI responses and conversation management

export interface ChatbotResponse {
  text: string;
  suggestions?: string[];
  action?: {
    type: 'navigate' | 'show_modal' | 'external_link';
    value: string;
  };
}

export interface ChatbotContext {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  currentPage?: string;
  previousMessages?: string[];
}

// Knowledge base for TomaShops-specific responses
const KNOWLEDGE_BASE = {
  selling: {
    keywords: ['sell', 'list', 'post', 'create listing', 'add item'],
    response: "To sell items on TomaShops, click the 'Sell' button in the navigation or visit /sell. You'll need to create an account, add photos, set a price, and provide a description. We make it easy to reach local buyers!",
    suggestions: ['How do I optimize my listing?', 'What are the fees?', 'How do I manage my listings?']
  },
  buying: {
    keywords: ['buy', 'purchase', 'shop', 'find', 'search'],
    response: "You can browse items by category, use the search function, or check out our featured listings. When you find something you like, you can message the seller directly or make an offer. All transactions are secure!",
    suggestions: ['How do I contact sellers?', 'Is it safe to buy?', 'What payment methods are accepted?']
  },
  safety: {
    keywords: ['safe', 'safety', 'secure', 'trust', 'scam', 'fraud'],
    response: "Your safety is our priority! We recommend meeting in public places, using secure payment methods, and communicating through our platform. Check out our Safety page for detailed guidelines and tips.",
    suggestions: ['Safety guidelines', 'How to spot scams', 'Meeting locations']
  },
  shipping: {
    keywords: ['ship', 'shipping', 'delivery', 'pickup', 'local'],
    response: "Most transactions on TomaShops are local pickups, but some sellers offer shipping. Shipping details are listed in each listing. For local items, you can arrange pickup with the seller directly.",
    suggestions: ['Local pickup tips', 'Shipping options', 'Delivery safety']
  },
  account: {
    keywords: ['account', 'profile', 'settings', 'login', 'register'],
    response: "You can manage your account by clicking on your profile in the top navigation. There you can update your information, view your listings, orders, and messages.",
    suggestions: ['Update profile', 'View my listings', 'Account settings']
  },
  categories: {
    keywords: ['category', 'categories', 'what do you sell', 'types', 'items'],
    response: "TomaShops offers a wide variety of categories including Electronics, Furniture, Clothing, Books, Sports Equipment, Home & Garden, and much more. We also have special sections for Rentals, Jobs, and Digital items!",
    suggestions: ['Browse Electronics', 'View Furniture', 'Check Rentals']
  },
  support: {
    keywords: ['help', 'support', 'contact', 'problem', 'issue', 'assist'],
    response: "For support, you can visit our Contact page, check our FAQ section, or reach out through our help center. We're here to help make your buying and selling experience smooth!",
    suggestions: ['Contact support', 'FAQ', 'Report issue']
  },
  fees: {
    keywords: ['fee', 'cost', 'price', 'charge', 'free'],
    response: "TomaShops is free to use for basic listings! We may charge small fees for premium features or promoted listings. All fees are clearly displayed before you commit to any paid services.",
    suggestions: ['Premium features', 'Pricing details', 'Free vs paid']
  },
  rentals: {
    keywords: ['rent', 'rental', 'borrow', 'lease'],
    response: "Yes! We have a dedicated Rentals section where you can find items to rent or list items for rent. This is perfect for tools, equipment, or items you only need temporarily.",
    suggestions: ['Browse rentals', 'List for rent', 'Rental policies']
  },
  jobs: {
    keywords: ['job', 'work', 'hire', 'employment', 'service'],
    response: "Our Jobs section connects local talent with opportunities. Whether you're looking for work or need help with a project, you can post or browse job listings in your area.",
    suggestions: ['Browse jobs', 'Post job', 'Hire help']
  },
  digital: {
    keywords: ['digital', 'online', 'software', 'download', 'virtual'],
    response: "We have a Digital section for digital products and services! This includes software, digital art, online courses, and more. Digital items can be delivered instantly and are perfect for remote transactions.",
    suggestions: ['Browse digital items', 'Sell digital products', 'Digital delivery']
  }
};

// Enhanced response generation with context awareness
export const generateResponse = async (
  userMessage: string,
  context?: ChatbotContext
): Promise<ChatbotResponse> => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Check knowledge base for relevant responses
  for (const [topic, data] of Object.entries(KNOWLEDGE_BASE)) {
    if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
      let response = data.response;
      
      // Personalize response if user is logged in
      if (context?.user && (topic === 'selling' || topic === 'account')) {
        response = response.replace(
          "You'll need to create an account",
          "Since you're already logged in"
        );
      }

      return {
        text: response,
        suggestions: data.suggestions
      };
    }
  }

  // Handle greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    if (context?.user) {
      return {
        text: `Hello ${context.user.name}! Great to see you back. How can I help you today? I can assist with finding items, managing your listings, or answering any questions about TomaShops.`,
        suggestions: ['How do I sell items?', 'Browse categories', 'Manage my account']
      };
    }
    return {
      text: "Hello! How can I help you today? I can assist with finding items, explaining how our marketplace works, or helping with your account. Feel free to ask me anything!",
      suggestions: ['How do I sell items?', 'Is it safe to buy here?', 'Create account']
    };
  }

  // Handle gratitude
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return {
      text: "You're welcome! I'm here to help make your TomaShops experience smooth and enjoyable. Is there anything else you'd like to know?",
      suggestions: ['Browse items', 'Sell something', 'Get help']
    };
  }

  // Default response with suggestions
  return {
    text: "I'm here to help with any questions about TomaShops! You can ask me about buying, selling, safety, shipping, or how our marketplace works. What would you like to know more about?",
    suggestions: ['How do I sell items?', 'Is it safe to buy here?', 'What categories do you have?', 'Contact support']
  };
};

// Get quick reply suggestions based on context
export const getQuickReplies = (context?: ChatbotContext): string[] => {
  if (context?.user) {
    return [
      "How do I sell items?",
      "Is it safe to buy here?",
      "Manage my account",
      "View my listings",
      "Contact support"
    ];
  }
  
  return [
    "How do I sell items?",
    "Is it safe to buy here?",
    "What categories do you have?",
    "How does shipping work?",
    "Create account"
  ];
};

// Analyze user intent for better response matching
export const analyzeIntent = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('how') && lowerMessage.includes('sell')) return 'selling_how';
  if (lowerMessage.includes('how') && lowerMessage.includes('buy')) return 'buying_how';
  if (lowerMessage.includes('safe') || lowerMessage.includes('security')) return 'safety';
  if (lowerMessage.includes('ship') || lowerMessage.includes('delivery')) return 'shipping';
  if (lowerMessage.includes('account') || lowerMessage.includes('profile')) return 'account';
  if (lowerMessage.includes('category') || lowerMessage.includes('what do you sell')) return 'categories';
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) return 'support';
  if (lowerMessage.includes('fee') || lowerMessage.includes('cost')) return 'fees';
  if (lowerMessage.includes('rent') || lowerMessage.includes('rental')) return 'rentals';
  if (lowerMessage.includes('job') || lowerMessage.includes('work')) return 'jobs';
  if (lowerMessage.includes('digital') || lowerMessage.includes('online')) return 'digital';
  
  return 'general';
}; 