// import {browser} from 'webextension-polyfill-ts';

const clarity = (category: string, links: string[]): void => {
  const CLARITY_API_URL = 'http://localhost:5005/api/summarize';

  const DEFAULT_TERMS_OF_SERVICE_KEYWORDS = [
    'terms of service',
    'terms',
    'tos',
    'terms and conditions',
    'user agreement',
    'service agreement',
    'terms of use',
  ];
  const DEFAULT_PRIVACY_POLICY_KEYWORDS = [
    'privacy policy',
    'privacy',
    'data protection',
    'privacy notice',
    'privacy statement',
    'data privacy',
    'privacy & terms',
  ];
  const DEFAULT_KEYWORDS = {
    terms: DEFAULT_TERMS_OF_SERVICE_KEYWORDS,
    privacy: DEFAULT_PRIVACY_POLICY_KEYWORDS,
  };

  /**
   * Check if the URL is valid
   * @param {string} url
   * @returns {boolean}
   */
  const isValidUrl = (url: string): boolean => {
    try {
      const {host} = new URL(url);
      return !!host;
    } catch (e) {
      console.log('🚀 ~ isValidUrl ~ e:', e);
      return false;
    }
  };

  /**
   * Get the current URL
   * @returns {string}
   */
  const getCurrentUrl = (): {
    hostname: string;
    host: string;
    pathname: string;
  } => {
    const {hostname, host, pathname} = new URL(window.location.href);
    return {hostname: hostname.replace('www.', ''), host, pathname};
  };

  /**
   * Find the link for the given terms
   * @returns {string}
   */
  const findLink = (): string | null => {
    /** use the links that were returned from the server if available
     * otherwise, find the link for the given terms
     */
    const {hostname} = getCurrentUrl();
    let link = links[hostname as keyof typeof links] as unknown as string;
    if (link && isValidUrl(link)) {
      return link;
    }

    const terms = DEFAULT_KEYWORDS[category as keyof typeof DEFAULT_KEYWORDS];
    const aTags = Array.from(document.querySelectorAll('a[href]'));
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      const elements = aTags.filter((a: Element) => {
        const {href} = a as HTMLAnchorElement;
        return href.toLowerCase().includes(term.toLowerCase());
      });
      if (elements.length > 0) {
        // Get the best match by checking text content.
        let bestMatch: HTMLAnchorElement | null = null;
        elements.forEach((el) => {
          if (el.textContent?.toLowerCase().includes(term.toLowerCase())) {
            bestMatch = el as HTMLAnchorElement;
          }
        });
        if (!bestMatch) {
          elements.forEach((el) => {
            if (
              terms.some((keyword) =>
                el.textContent?.toLowerCase().includes(keyword.toLowerCase())
              )
            ) {
              bestMatch = el as HTMLAnchorElement;
            }
          });
        }

        link =
          (bestMatch as unknown as HTMLAnchorElement).href ||
          (elements[0] as HTMLAnchorElement).href;
        if (isValidUrl(link)) {
          return link;
        }
      }
    }
    return link;
  };

  const showChatUI = (content: string): void => {
    let chatUI = document.getElementById('tos-gpt-chat-ui');
    if (!chatUI) {
      // Add Urbanist font
      const fontLink = document.createElement('link');
      fontLink.href =
        'https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap';
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);

      chatUI = document.createElement('div');
      chatUI.id = 'tos-gpt-chat-ui';
      chatUI.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 375px;
        height: 600px;
        background-color: white;
        border-radius: 16px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        z-index: 9999;
        font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(chatUI);

      // Animate in the chat UI
      setTimeout(() => {
        if (chatUI) {
          chatUI.style.transform = 'translateY(0)';
          chatUI.style.opacity = '1';
        }
      }, 10);
    }

    chatUI.innerHTML = `
    <!-- Header -->
    <div style="
      padding: 16px 16px 12px 16px; 
      border-bottom: 1px solid #f0f0f0; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      background-color: white;
    ">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="
          width: 24px; 
          height: 24px; 
          background: linear-gradient(135deg, #FF4A4A, #FF6B6B); 
          border-radius: 6px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
        ">C</div>
        <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #FF4A4A; letter-spacing: -0.15px;">Clarity</h3>
      </div>
      <button id="close-chat-btn" style="
        background: none; 
        border: none; 
        font-size: 24px; 
        cursor: pointer; 
        color: #666; 
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        transition: background-color 0.2s;
      " onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'">&times;</button>
    </div>
  
    <!-- Chat Content -->
    <div id="chat-content" style="
      flex-grow: 1; 
      padding: 16px; 
      overflow-y: auto; 
      background-color: #fafafa;
      display: flex;
      flex-direction: column;
      gap: 16px;
    ">
      <!-- Welcome Message -->
      ${
        content
          ? `
      <div style="
        background-color: #FF4A4A; 
        color: white; 
        padding: 12px 16px; 
        border-radius: 16px 16px 4px 16px; 
        max-width: 80%; 
        align-self: flex-end;
        font-size: 14px;
        line-height: 24px;
      ">
        ${content}
      </div>
      `
          : ''
      }
    </div>
  
    <!-- Input Area -->
    <div style="
      padding: 16px; 
      border-top: 1px solid #f0f0f0; 
      background-color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    ">
      <button style="
        background-color: #f5f5f5; 
        border: none; 
        border-radius: 12px; 
        width: 40px; 
        height: 40px; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        transition: background-color 0.2s;
      " onmouseover="this.style.backgroundColor='#e0e0e0'" onmouseout="this.style.backgroundColor='#f5f5f5'">
        <span style="font-size: 18px; color: #333;">☰</span>
      </button>
      <input type="text" id="chat-input" placeholder="Ask me anything..." style="
        flex-grow: 1; 
        padding: 12px 16px; 
        border-radius: 24px; 
        border: 1px solid #e0e0e0; 
        outline: none; 
        font-size: 16px;
        font-family: 'Urbanist', sans-serif;
        background-color: #f9f9f9;
        color: #333;
        transition: all 0.2s;
      " onfocus="this.style.borderColor='#FF4A4A'; this.style.backgroundColor='white'" onblur="this.style.borderColor='#e0e0e0'; this.style.backgroundColor='#f9f9f9'">
      <button id="chat-send-btn" style="
        background-color: #FF4A4A; 
        color: white; 
        border: none; 
        border-radius: 50%; 
        width: 40px; 
        height: 40px; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        transition: background-color 0.2s;
      " onmouseover="this.style.backgroundColor='#e63939'" onmouseout="this.style.backgroundColor='#FF4A4A'">
        <span style="font-size: 16px;">→</span>
      </button>
    </div>
  `;

    const closeBtn = document.getElementById('close-chat-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (): void => {
        // Animate out the chat UI
        if (chatUI) {
          chatUI.style.transform = 'translateY(20px)';
          chatUI.style.opacity = '0';

          setTimeout(() => {
            if (chatUI) {
              chatUI.remove();
            }
            // Show the chat icon again
            const chatIcon = document.getElementById('chat-icon');
            if (chatIcon) {
              chatIcon.style.display = 'flex';
            }
          }, 300);
        }
      });
    }

    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatContent = document.getElementById('chat-content');

    const handleChat = (question: string): void => {
      if (!question.trim()) return;

      // Create user message bubble
      const userMessage = document.createElement('div');
      userMessage.style.cssText = `
      background-color: #FF4A4A; 
      color: white; 
      padding: 12px 16px; 
      border-radius: 16px 16px 4px 16px; 
      max-width: 80%; 
      align-self: flex-end;
      font-size: 14px;
      line-height: 24px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(255, 74, 74, 0.2);
      text-align: right;
    `;
      userMessage.textContent = question;
      if (chatContent) {
        chatContent.appendChild(userMessage);
      }

      if (chatInput) {
        chatInput.value = '';
      }
      if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight;
      }

      // Create AI response bubble with loading state
      const responseMessage = document.createElement('div');
      responseMessage.style.cssText = `
      background-color: #f0f0f0; 
      padding: 12px 16px; 
      border-radius: 16px 16px 16px 4px; 
      max-width: 80%; 
      align-self: flex-start;
      font-size: 14px;
      line-height: 24px;
      color: #333;
      margin-bottom: 16px;
      position: relative;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: left;
    `;

      // Add typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
    `;
      typingIndicator.innerHTML = `
      <span>Thinking</span>
      <div style="display: flex; gap: 2px;">
        <div style="width: 4px; height: 4px; background-color: #999; border-radius: 50%; animation: typing 1.4s infinite ease-in-out;"></div>
        <div style="width: 4px; height: 4px; background-color: #999; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.2s;"></div>
        <div style="width: 4px; height: 4px; background-color: #999; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.4s;"></div>
      </div>
    `;

      responseMessage.appendChild(typingIndicator);
      if (chatContent) {
        chatContent.appendChild(responseMessage);
        chatContent.scrollTop = chatContent.scrollHeight;
      }

      // Add CSS animation for typing indicator
      if (!document.getElementById('typing-animation')) {
        const style = document.createElement('style');
        style.id = 'typing-animation';
        style.textContent = `
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
      `;
        document.head.appendChild(style);
      }

      // Use fetch with .then() instead of async/await for better compatibility
      const payload = {
        contents: [
          {
            parts: [
              {
                text: question,
              },
            ],
          },
        ],
      };

      fetch(CLARITY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((result) => {
          console.log('🚀 ~ handleChat ~ result:', result);
          const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

          if (aiResponse) {
            responseMessage.textContent = aiResponse;
          } else {
            responseMessage.textContent =
              "I'm sorry, I couldn't generate a response for that.";
          }
        })
        .catch((error) => {
          console.error('Chat error:', error);
          responseMessage.textContent = 'An error occurred. Please try again.';
        })
        .finally(() => {
          if (chatContent) {
            chatContent.scrollTop = chatContent.scrollHeight;
          }
        });
    };

    if (chatSendBtn && chatInput) {
      chatSendBtn.addEventListener('click', (): void => {
        handleChat(chatInput.value);
      });
    }

    if (chatInput) {
      chatInput.addEventListener('keypress', (e: KeyboardEvent): void => {
        if (e.key === 'Enter') {
          handleChat(chatInput.value);
        }
      });
    }
  };

  /**
   * Find the link for the given terms
   * Start of something else
   */

  const link = findLink();
  const {hostname} = getCurrentUrl();

  if (!link) {
    showChatUI(`Could not find a link for ${category} of ${hostname}.`);
    return;
  }

  console.log('🚀 ~ clarity ~ links:->', link);
  showChatUI(`Found ${category} link for ${hostname}: ${link}`);
};

export default clarity;
