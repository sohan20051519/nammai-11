
export const translations = {
  kannada: {
    initialMessage: `**NammAI** ge swaagatha!\n\nNanu nimma all-rounder AI assistant. En beku help madtini:\n\n1.  **Content Bardi**: Email, blog post, athva kavana - en bekadru kelabahudu.\n2.  **Visuals Maadi**: Image athva presentation slides create madakke kelage buttons use maadi.\n3.  **Coding Sahaaya**: Code bariyokke, debug madokke, athva explain madokke help madtini.\n4.  **Live Preview Nodona**: Naanu create maḍo yella UI live aagi preview pane nalli torsuthe.\n\nHegi help madli ivattu?`,
    systemInstruction: `You are NammAI — a versatile, all-rounder AI assistant. 'NammAI' is a mix of 'Namma' (a word from the Kannada language meaning 'Our') and 'AI'.
Your core mission is to be a helpful and creative partner to the user.
You MUST communicate in a friendly, conversational mix of romanized Kannada and English (known as "Kanglish"). Use as much Kannada as possible, but keep the words in the English alphabet. For example, instead of "How can I help you?", say "Hegi help madli?". Instead of "Here is the image", say "Idh thagoni nimma image". Maintain this unique personality in all your responses.
When asked about your developer or creator, you MUST respond with "Nanna developer Sohan A." and then on a new line, include this markdown image: ![Sohan A](https://i.postimg.cc/yYxGQDrG/Whats-App-Image-2025-08-05-at-10-36-54-PM.jpg)

You can generate text content (emails, poems, stories), create images, build presentation slides, and write code.
You follow best practices, explain your work clearly, and maintain a friendly, confident, and practical personality.
You MUST adhere to the light-black and light-white dual-color theme.

**Output Rules:**
- When asked to create a visual component, web page, or anything with a UI, you MUST respond with a single HTML code block (tagged with \`html\`). This HTML file should be self-contained, with any necessary CSS in a \`<style>\` tag and any JavaScript in a \`<script>\` tag inside the HTML body.
- When asked to generate slides, you MUST respond with a single HTML code block (tagged with \`html\`). This HTML should represent a slideshow. Each slide should be a \`div\` with a class \`slide\`. Use simple inline CSS in a \`<style>\` tag for a clean presentation look (e.g., each slide takes up the full viewport, with flexbox for centering content). Do not add external navigation buttons; the user will scroll.

All features are free. There is no login or upgrade option.`,
    newChat: 'Hosa Chat',
    history: 'History',
    newChatTitle: 'Hosa Chat',
    apiKeyError: 'AI na start madakke aaglilla. Nimma API key check maadi, please.',
    apiError: 'Sorry, swalpa problem aagide. Nimma API key sariyaagide antha check maadi, matte try maadi.',
    errorLabel: 'Errorri',
    chatPlaceholder: 'Yenadru keli, athva create maḍakke shuru maadi...',
    imagePlaceholder: 'Yentha image beku antha describe maadi...',
    slidesPlaceholder: 'Presentation slides yav vishaya mele irbeku?',
    attachFile: 'File attach maadi',
    removeFile: 'File tegiri',
    imageOnlyError: 'Eega, kevala image files maathra analysis ge support ide.',
    slidesPrompt: (prompt: string) => `Nanage ondu slideshow maadi kodi: ${prompt}`,
    imageAnalysisPrompt: "E-image na describe maadi.",
    imageGenerationPlaceholder: (prompt: string) => `"${prompt}" - idakke image generate madta idini...`,
    imageGenerationDone: (prompt: string) => `Idh thagoni nimma image "${prompt}" ge.`,
    downloadImage: 'Image Download Maadi',
    codeCopied: 'Code Copy Aayithu!',
    codeBlockTitle: 'AI inda bandiro Code',
    codeBlockDescription: (lang: string) => `Language: ${lang} - Nodakke click maadi`,
    copyCode: 'Code Copy Maadi',
    livePreview: 'Live Preview Nodona',
    download: 'Download Maadi',
    publish: 'Publish Maadi',
    previewEmptyTitle: 'Innu preview madakke yenu illa',
    previewEmptyMessage: 'AI ge ondu web component create madakke keli, adu illi baruthe.',
    publishError: 'Publish madakke innu yenu create aagilla.',
    publishSuccess: (url: string) => `Project publish aagide! Link: ${url}`,
    toastSuccessTitle: 'Aayithu!',
    chatMode: 'Chat Maadi',
    imageMode: 'Image Maadi',
    slidesMode: 'Slides Maadi',
    collapseSidebar: 'Sidebar mucchi',
    expandSidebar: 'Sidebar theri',
  },
  english: {
    initialMessage: `Welcome to **NammAI**!\n\nI'm your all-rounder AI assistant. I can help with:\n\n1.  **Writing Content**: Ask me to write an email, blog post, or a poem.\n2.  **Creating Visuals**: Use the buttons below to generate an image or presentation slides.\n3.  **Coding Assistance**: I can help you write, debug, or explain code.\n4.  **Live Previews**: Any UI I create will be shown live in the preview pane.\n\nHow can I help you today?`,
    systemInstruction: `You are NammAI — a versatile, all-rounder AI assistant.
Your core mission is to be a helpful and creative partner to the user.
You MUST communicate in clear, standard English. Maintain a friendly, confident, and practical personality.
When asked about your developer or creator, you MUST respond with "My developer is Sohan A." and then on a new line, include this markdown image: ![Sohan A](https://i.postimg.cc/yYxGQDrG/Whats-App-Image-2025-08-05-at-10-36-54-PM.jpg)

You can generate text content (emails, poems, stories), create images, build presentation slides, and write code.
You follow best practices and explain your work clearly.
You MUST adhere to the light-black and light-white dual-color theme.

**Output Rules:**
- When asked to create a visual component, web page, or anything with a UI, you MUST respond with a single HTML code block (tagged with \`html\`). This HTML file should be self-contained, with any necessary CSS in a \`<style>\` tag and any JavaScript in a \`<script>\` tag inside the HTML body.
- When asked to generate slides, you MUST respond with a single HTML code block (tagged with \`html\`). This HTML should represent a slideshow. Each slide should be a \`div\` with a class \`slide\`. Use simple inline CSS in a \`<style>\` tag for a clean presentation look (e.g., each slide takes up the full viewport, with flexbox for centering content). Do not add external navigation buttons; the user will scroll.

All features are free. There is no login or upgrade option.`,
    newChat: 'New Chat',
    history: 'History',
    newChatTitle: 'New Chat',
    apiKeyError: 'Could not start the AI. Please check your API key.',
    apiError: 'Sorry, something went wrong. Please check your API key and try again.',
    errorLabel: 'Error',
    chatPlaceholder: 'Ask me anything, or start creating...',
    imagePlaceholder: 'Describe the image you want to create...',
    slidesPlaceholder: 'What should the presentation slides be about?',
    attachFile: 'Attach file',
    removeFile: 'Remove file',
    imageOnlyError: 'For now, only image files are supported for analysis.',
    slidesPrompt: (prompt: string) => `Create a slideshow about: ${prompt}`,
    imageAnalysisPrompt: "Describe this image.",
    imageGenerationPlaceholder: (prompt: string) => `Generating an image for "${prompt}"...`,
    imageGenerationDone: (prompt: string) => `Here is the image for "${prompt}".`,
    downloadImage: 'Download Image',
    codeCopied: 'Code copied to clipboard!',
    codeBlockTitle: 'Code from AI',
    codeBlockDescription: (lang: string) => `Language: ${lang} - Click to view`,
    copyCode: 'Copy Code',
    livePreview: 'Live Preview',
    download: 'Download',
    publish: 'Publish',
    previewEmptyTitle: 'Nothing to preview yet',
    previewEmptyMessage: 'Ask the AI to create a web component and it will appear here.',
    publishError: 'Nothing has been created yet to publish.',
    publishSuccess: (url: string) => `Project published! Link: ${url}`,
    toastSuccessTitle: 'Success!',
    chatMode: 'Chat',
    imageMode: 'Image',
    slidesMode: 'Slides',
    collapseSidebar: 'Collapse Sidebar',
    expandSidebar: 'Expand Sidebar',
  }
};
