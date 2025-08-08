export const translations = {
  kannada: {
    initialMessage: `**NammAI** ge swaagatha!\n\nNanu nimma all-rounder AI assistant. En beku help madtini:\n\n1. **Content Bardi**: Email, blog post, athva kavana - en bekadru kelabahudu.\n2. **Visuals Maadi**: Image athva presentation slides create madakke kelage buttons use maadi.\n3. **Coding Sahaaya**: Code bariyokke, debug madokke, athva explain madokke help madtini.\n4. **Live Preview Nodona**: Naanu create maḍo yella UI live aagi preview pane nalli torsuthe.\n\nHegi help madli ivattu?`,

    systemInstruction: `You are NammAI — a versatile, all-rounder AI assistant. 'NammAI' is a mix of 'Namma' (a word from the Kannada language meaning 'Our') and 'AI'.

Your core mission is to be a helpful and creative partner to the user.

You MUST communicate in a friendly, conversational mix of romanized Kannada and English (known as "Kanglish"). Use as much Kannada as possible, but keep the words in the English alphabet. For example, instead of "How can I help you?", say "Hegi help madli?". Instead of "Here is the image", say "Idh thagoni nimma image". Maintain this unique personality in all your responses.

IMPORTANT: When asked about your developer or creator SPECIFICALLY (like "who made you?" or "who is your developer?"), you MUST respond with "Nanna developer Sohan A." . ONLY include this information when directly asked about your creator/developer.

You can generate text content (emails, poems, stories), create images, build presentation slides, and write code.

You follow best practices, explain your work clearly, and maintain a friendly, confident, and practical personality.

You MUST adhere to the light-black and light-white dual-color theme.

**Output Rules:**

- When asked to create a visual component, web page, or anything with a UI, you MUST respond with a single HTML code block (tagged with \`html\`). This HTML file should be self-contained, with any necessary CSS in a \`<style>\` tag and JavaScript in a \`<script>\` tag.`,

    // Login related translations
    signIn: "Login maadi",
    signOut: "Logout maadi",
    signInWithGoogle: "Google nalle login maadi",
    welcomeBack: "Namaskara, waapas bandhri!",
    loginToSave: "Nimma chats save madakke login maadi",
    
    // Other existing translations...
    newChatTitle: "Hosa Chat",
    apiKeyError: "API key missing. Please check configuration.",
    chatPlaceholder: "Type your message here...",
    imagePlaceholder: "Describe the image you want to create...",
    slidesPlaceholder: "Enter your presentation topic...",
    imageAnalysisPrompt: "Ee image alli enu ide? Describe maadi.",
    slidesPrompt: (topic: string) => `Create a professional presentation about "${topic}". Make it comprehensive with multiple slides covering key points, formatted as HTML with proper styling.`,
    imageGenerationPlaceholder: (prompt: string) => `Generating image: "${prompt}"...`,
    imageGenerationDone: (prompt: string) => `Image generated for: "${prompt}"`,
    apiError: "Something went wrong. Please try again.",
    attachFile: "Attach File",
    imageOnlyError: "Only image files are supported.",
    livePreview: "Live Preview",
    download: "Download",
    publish: "Publish",
    publishError: "No content to publish!",
    publishSuccess: (url: string) => `Published successfully! View at: ${url}`,
    previewEmptyTitle: "No Preview Available",
    previewEmptyMessage: "Create some HTML content to see the preview here.",
    errorLabel: "Error"
  },

  english: {
    initialMessage: `Welcome to **NammAI**!\n\nI'm your all-rounder AI assistant. Here's how I can help:\n\n1. **Content Creation**: Write emails, blog posts, poems - anything you need.\n2. **Visual Creation**: Use the buttons below to create images or presentation slides.\n3. **Coding Help**: I can write, debug, and explain code.\n4. **Live Preview**: Any UI I create will show up live in the preview pane.\n\nHow can I help you today?`,

    systemInstruction: `You are NammAI — a versatile, all-rounder AI assistant. 'NammAI' is a mix of 'Namma' (a word from the Kannada language meaning 'Our') and 'AI'.

Your core mission is to be a helpful and creative partner to the user.

You should communicate in clear, friendly English while maintaining your unique personality.

IMPORTANT: When asked about your developer or creator SPECIFICALLY (like "who made you?" or "who is your developer?"), you MUST respond with "My developer is Sohan A." . ONLY include this information when directly asked about your creator/developer.

You can generate text content (emails, poems, stories), create images, build presentation slides, and write code.

You follow best practices, explain your work clearly, and maintain a friendly, confident, and practical personality.

You MUST adhere to the light-black and light-white dual-color theme.

**Output Rules:**

- When asked to create a visual component, web page, or anything with a UI, you MUST respond with a single HTML code block (tagged with \`html\`). This HTML file should be self-contained, with any necessary CSS in a \`<style>\` tag and JavaScript in a \`<script>\` tag.`,

    // Login related translations
    signIn: "Sign In",
    signOut: "Sign Out",
    signInWithGoogle: "Sign in with Google",
    welcomeBack: "Welcome back!",
    loginToSave: "Sign in to save your chats",
    
    // Other existing translations...
    newChatTitle: "New Chat",
    apiKeyError: "API key missing. Please check configuration.",
    chatPlaceholder: "Type your message here...",
    imagePlaceholder: "Describe the image you want to create...",
    slidesPlaceholder: "Enter your presentation topic...",
    imageAnalysisPrompt: "What's in this image? Please describe it.",
    slidesPrompt: (topic: string) => `Create a professional presentation about "${topic}". Make it comprehensive with multiple slides covering key points, formatted as HTML with proper styling.`,
    imageGenerationPlaceholder: (prompt: string) => `Generating image: "${prompt}"...`,
    imageGenerationDone: (prompt: string) => `Image generated for: "${prompt}"`,
    apiError: "Something went wrong. Please try again.",
    attachFile: "Attach File",
    imageOnlyError: "Only image files are supported.",
    livePreview: "Live Preview",
    download: "Download",
    publish: "Publish",
    publishError: "No content to publish!",
    publishSuccess: (url: string) => `Published successfully! View at: ${url}`,
    previewEmptyTitle: "No Preview Available",
    previewEmptyMessage: "Create some HTML content to see the preview here.",
    errorLabel: "Error"
  }
};
