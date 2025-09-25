// Declare Summarizer as a global object
declare const Summarizer: {
  availability(): Promise<string>;
  create(options: Record<string, unknown>): Promise<{
    summarize(text: string): Promise<string>;
  }>;
};

declare const chrome: {
  storage: {
    sync: {
      get(key: string): Promise<{[key: string]: string}>;
    };
  };
};

declare const Translator: {
  availability({
    sourceLanguage,
    targetLanguage,
    monitor,
  }: {
    sourceLanguage: string;
    targetLanguage: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    monitor: (m: any) => void;
  }): Promise<string>;
  create({
    sourceLanguage,
    targetLanguage,
  }: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<{translate: (text: string) => Promise<string>}>;
};

declare const self: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Translator: typeof Translator;
};

const clarity = (category: string, externalLink?: string): void => {
  const CLARITY_API_URL = 'http://localhost:3000/api';
  const {hostname} = new URL(window.location.href);

  /**
   * Chat ID generated from hostname, category and date
   */
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateString = `${day}_${month}_${year}`;
  const chatId = `${hostname}_${category}_${dateString}`;

  console.log('🚀 ~ clarity ~ chatId:', chatId);
  // Track the current language state of each message
  const messageLanguageState = new Map<string, string>();

  const languageSelector = (
    id: string
  ): string => `<select class="translate-selector" id="select-${id}" data-message-id="${id}" style="
              padding: 4px 8px 4px 4px;
              border: 1px solid #e0e0e0;
              border-radius: 6px;
              background-color: white;
              font-size: 12px;
              color: #666;
              cursor: pointer;
              outline: none;
              transition: border-color 0.2s;
            " onfocus="this.style.borderColor='#FF4A4A'" onblur="this.style.borderColor='#e0e0e0'">
              <option value="">🌐 Translate</option>
              <option value="en">🏴󠁧󠁢󠁥󠁮󠁧󠁿 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="it">🇮🇹 Italian</option>
              <option value="pt">🇵🇹 Portuguese</option>
              <option value="ru">🇷🇺 Russian</option>
              <option value="ja">🇯🇵 Japanese</option>
              <option value="ko">🇰🇷 Korean</option>
              <option value="zh">🇨🇳 Chinese</option>
              <option value="ar">🇸🇦 Arabic</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="nl">🇳🇱 Dutch</option>
              <option value="sv">🇸🇪 Swedish</option>
              <option value="no">🇳🇴 Norwegian</option>
              <option value="da">🇩🇰 Danish</option>
              <option value="fi">🇫🇮 Finnish</option>
              <option value="pl">🇵🇱 Polish</option>
              <option value="tr">🇹🇷 Turkish</option>
              <option value="th">🇹🇭 Thai</option>
            </select>`;

  const translateContent = ({
    sourceLanguage,
    targetLanguage,
    messageElement,
    originalText,
    messageId,
  }: {
    sourceLanguage: string;
    targetLanguage: string;
    messageElement: HTMLElement;
    originalText: string;
    messageId: string;
  }): void => {
    if (!targetLanguage) return;
    if (!self.Translator) return;

    // Update the language state for this message
    messageLanguageState.set(messageId, targetLanguage);
    // Add a translation note
    const translationNote = document.createElement('div');
    translationNote.style.cssText = `
       font-size: 12px;
       color: #666;
       font-style: italic;
       margin-top: 8px;
       padding-top: 8px;
       border-top: 1px solid #e0e0e0;
     `;

    translationNote.textContent = `🌐 Translating to ${targetLanguage.toUpperCase()}...`;
    messageElement.appendChild(translationNote);
    Translator.availability({
      sourceLanguage,
      targetLanguage,
      monitor(m) {
        // TODO: add a monitor for the Translator model that displays the progress in chat
        m.addEventListener('downloadprogress', (e: {loaded: number}) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      },
    })
      .then(() => {
        Translator.create({
          sourceLanguage,
          targetLanguage,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }).then((translator: any) => {
          translator
            .translate(originalText)
            .then((translatedText: string) => {
              messageElement.innerHTML = translatedText;

              translationNote.textContent = `🌐 Translated to ${targetLanguage.toUpperCase()}`;
              messageElement.appendChild(translationNote);
            })
            .catch((error: unknown) => {
              console.log('🚀 ~ translateContent ~ error:', error);
            });
        });
      })
      .catch((error) => {
        console.log('🚀 ~ translateContent ~ error:', error);
      });
  };

  const browserSummarize = (
    link: string,
    responseElement: HTMLElement
  ): void => {
    fetch(`${CLARITY_API_URL}/gethtml?url=${encodeURIComponent(link)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        Summarizer.availability().then((status: string) => {
          if (status !== 'available') {
            return;
          }

          const options = {
            sharedContext:
              'This article is meant for non-technical users. Please summarize the article in a way that is easy to understand.',
            type: 'key-points',
            format: 'markdown',
            length: 'medium',
            // TODO: add a monitor for the summarizer that displays the progress in chat
            // monitor(m) {
            //   m.addEventListener("downloadprogress", (e) => {
            //     console.log(`Downloaded ${e.loaded * 100}%`);
            //   });
            // },
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Summarizer.create(options).then((summarizer: any) => {
            // Process chunks if available, otherwise use full text
            if (result.textChunks && result.textChunks.length > 0) {
              // Create array of promises for all chunk summarizations
              const summarizationPromises = result.textChunks.map(
                (chunk: string) => summarizer.summarize(chunk)
              );

              // Wait for all summarizations to complete
              Promise.all(summarizationPromises)
                .then((chunkSummaries: string[]) => {
                  // Combine all chunk summaries
                  const combinedSummary = chunkSummaries.join(' ');

                  // Generate unique ID for this message
                  const messageId = `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                  // Initialize language state for this message (default to 'en')
                  messageLanguageState.set(messageId, 'en');

                  responseElement.innerHTML = `
                    <div style="white-space: pre-wrap;" id="${messageId}">${combinedSummary}</div>
                    <div style="
                      margin-top: 12px;
                      padding-top: 8px;
                      border-top: 1px solid #e0e0e0;
                      display: flex;
                      align-items: center;
                      gap: 8px;
                    ">
                      ${languageSelector(messageId)}
                    </div>
        `;

                  // Add event listener for this specific message's translate button
                  const translateSelector = responseElement.querySelector(
                    `[data-message-id="${messageId}"]`
                  ) as HTMLSelectElement;
                  if (translateSelector) {
                    translateSelector.addEventListener('change', (): void => {
                      const selectedLanguage = translateSelector.value;
                      if (selectedLanguage) {
                        const targetMessage =
                          document.getElementById(messageId);
                        if (targetMessage) {
                          // Get current language state or default to 'en'
                          const currentSourceLanguage =
                            messageLanguageState.get(messageId) || 'en';
                          translateContent({
                            sourceLanguage: currentSourceLanguage,
                            targetLanguage: selectedLanguage,
                            messageElement: targetMessage,
                            originalText: combinedSummary,
                            messageId,
                          });
                        }
                        // Reset the selector
                        translateSelector.value = selectedLanguage;
                      }
                    });
                  }
                })
                .catch((error: unknown) => {
                  console.log('🚀 ~ browserSummarize ~ error:', error);
                  responseElement.innerHTML = `<div style="color: red;">Error summarizing content: ${error}</div>`;
                });
            } else {
              summarizer
                .summarize(result.text)
                .then((c: string) => {
                  // Generate unique ID for this message
                  const messageId = `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                  // Initialize language state for this message (default to 'en')
                  messageLanguageState.set(messageId, 'en');

                  responseElement.innerHTML = `
                  <div style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                  ">
                    <style>
                      .clarity-content ul {
                        margin: 8px 0;
                        padding-left: 20px;
                      }
                      .clarity-content li {
                        margin: 4px 0;
                      }
                      .clarity-content p {
                        margin: 8px 0;
                      }
                      .clarity-content b {
                        font-weight: 600;
                      }
                    </style>
                    <div class="clarity-content" id="${messageId}">${c}</div>
                    <div style="
                      margin-top: 12px;
                      padding-top: 8px;
                      border-top: 1px solid #e0e0e0;
                      display: flex;
                      align-items: center;
                      gap: 8px;
                    ">
                      ${languageSelector(messageId)}
                    </div>
                  </div>
        `;

                  // Add event listener for this specific message's translate button
                  const translateSelector = responseElement.querySelector(
                    `[data-message-id="${messageId}"]`
                  ) as HTMLSelectElement;
                  if (translateSelector) {
                    translateSelector.addEventListener('change', (): void => {
                      const selectedLanguage = translateSelector.value;
                      if (selectedLanguage) {
                        const targetMessage =
                          document.getElementById(messageId);
                        if (targetMessage) {
                          // Get current language state or default to 'en'
                          const currentSourceLanguage =
                            messageLanguageState.get(messageId) || 'en';
                          translateContent({
                            sourceLanguage: currentSourceLanguage,
                            targetLanguage: selectedLanguage,
                            messageElement: targetMessage,
                            originalText: c,
                            messageId,
                          });
                        }
                        // Reset the selector
                        translateSelector.value = selectedLanguage;
                      }
                    });
                  }
                })
                .catch((error: unknown) => {
                  console.error('Error processing full text:', error);
                });
            }
          });
        });
      })
      .catch((error) => {
        console.error('Browser summarize error:', error);
      });
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

      fetch(`${CLARITY_API_URL}/chat`, {
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
          console.log('🚀 ~ handleChat ~ error:', error);
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

  const cachePolicy = localStorage.getItem(`${hostname}_${category}`);
  /**
   * Find the link for the given terms
   * Start of something else
   */

  let internalLink = externalLink!;
  if (cachePolicy) {
    const policy = JSON.parse(cachePolicy);
    internalLink = policy.link;
  }

  if (!internalLink) {
    showChatUI(`Could not find a link for ${category} of ${hostname}.`);
    return;
  }

  showChatUI('');

  const chatContent = document.getElementById('chat-content');
  if (!chatContent) {
    showChatUI(`Could not find chat content`);
    return;
  }

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
  userMessage.innerHTML = `Tell me about the ${category} of <a href="${internalLink}" target="_blank">${hostname}</a>.`;
  chatContent.appendChild(userMessage);

  // Create AI response bubble with loading state
  const responseMessage = document.createElement('div');
  responseMessage.style.cssText = `
    background-color: #f0f0f0; 
    padding: 12px 16px; 
    border-radius: 16px 16px 16px 4px; 
    max-width: 90%; 
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
  chatContent.appendChild(responseMessage);
  chatContent.scrollTop = chatContent.scrollHeight;

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

  const serverSummarize = ({
    url,
    browserId,
    userId,
    messageElement,
    contentCategory,
  }: {
    url: string;
    browserId: string;
    userId: string;
    messageElement: HTMLElement;
    contentCategory: string;
  }): void => {
    console.log('🚀 ~ serverSummarize ~ browserId:', browserId);
    // If no cached content, proceed with API call
    fetch(`${CLARITY_API_URL}/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        link: url,
        type: contentCategory,
        userId,
        chatId,
        message: userMessage.innerText,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        // Generate unique ID for this message
        const messageId = `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Initialize language state for this message (default to 'en')
        messageLanguageState.set(messageId, 'en');

        // Render the HTML content directly since the server returns formatted HTML
        // Add some styling to ensure proper rendering
        messageElement.innerHTML = `
          <div style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
          ">
            <style>
              .clarity-content ul {
                margin: 8px 0;
                padding-left: 20px;
              }
              .clarity-content li {
                margin: 4px 0;
              }
              .clarity-content p {
                margin: 8px 0;
              }
              .clarity-content b {
                font-weight: 600;
              }
            </style>
            <div class="clarity-content" id="${messageId}">
              ${result.text}
            </div>
            <div style="
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #e0e0e0;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              ${languageSelector(messageId)}
            </div>
          </div>
        `;
        // Add event listener for this specific message's translate button
        const translateSelector = messageElement.querySelector(
          `[data-message-id="${messageId}"]`
        ) as HTMLSelectElement;
        if (translateSelector) {
          translateSelector.addEventListener('change', (): void => {
            const selectedLanguage = translateSelector.value;
            if (selectedLanguage) {
              const targetMessage = document.getElementById(messageId);
              if (targetMessage) {
                // Get current language state or default to 'en'
                const currentSourceLanguage =
                  messageLanguageState.get(messageId) || 'en';
                translateContent({
                  sourceLanguage: currentSourceLanguage,
                  targetLanguage: selectedLanguage,
                  messageElement: targetMessage,
                  originalText: result.text,
                  messageId,
                });
              }
              // Reset the selector
              translateSelector.value = selectedLanguage;
            }
          });
        }
      })
      .catch((error) => {
        console.log('🚀 ~ serverSummarize ~ error:', error);
        messageElement.innerHTML = `<div style="color: red;">Error summarizing content: ${error}</div>`;
      });
  };

  chrome.storage.sync.get('clarityBrowserId').then((browserId) => {
    if (!browserId.clarityBrowserId) {
      browserSummarize(internalLink, responseMessage);
      return;
    }
    chrome.storage.sync.get('clarityUserId').then((userId) => {
      if (!userId.clarityUserId) {
        browserSummarize(internalLink, responseMessage);
        return;
      }
      serverSummarize({
        url: internalLink,
        browserId: browserId.clarityBrowserId,
        userId: userId.clarityUserId,
        messageElement: responseMessage,
        contentCategory: category,
      });
    });
  });
};

export default clarity;
