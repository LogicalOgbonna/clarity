declare const chrome: {
  storage: {
    sync: {
      get(key: string): Promise<{[key: string]: string}>;
    };
  };
};

type Message = {
  chatId: string;
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: {
    type: 'text' | 'reasoning' | 'source-url' | 'source-document' | 'file' | 'step-start' | 'step-end';
    text: string;
  }[];
  attachments: unknown[];
  createdAt: string;
};

type Chat = {
  id: string;
  createdAt: string;
  title: string;
  visibility: string;
  traceId: string | null;
  observationId: string | null;
  messages: Message[];
};

const clarity = (category: string, externalLink?: string): void => {
  const CLARITY_API_URL = 'https://admin.blucarbone.co/api/clarity/api';

  const languages: Array<{
    code: string;
    name: string;
    flag: string;
  }> = [
    {code: '', name: 'Translate', flag: '🌐'},
    {code: 'en', name: 'English', flag: '🇺🇸'},
    {code: 'es', name: 'Spanish', flag: '🇪🇸'},
    {code: 'fr', name: 'French', flag: '🇫🇷'},
    {code: 'de', name: 'German', flag: '🇩🇪'},
    {code: 'it', name: 'Italian', flag: '🇮🇹'},
    {code: 'pt', name: 'Portuguese', flag: '🇵🇹'},
    {code: 'ru', name: 'Russian', flag: '🇷🇺'},
    {code: 'ja', name: 'Japanese', flag: '🇯🇵'},
    {code: 'ko', name: 'Korean', flag: '🇰🇷'},
    {code: 'zh', name: 'Chinese', flag: '🇨🇳'},
    {code: 'ar', name: 'Arabic', flag: '🇸🇦'},
    {code: 'hi', name: 'Hindi', flag: '🇮🇳'},
    {code: 'nl', name: 'Dutch', flag: '🇳🇱'},
    {code: 'sv', name: 'Swedish', flag: '🇸🇪'},
    {code: 'no', name: 'Norwegian', flag: '🇳🇴'},
    {code: 'da', name: 'Danish', flag: '🇩🇰'},
    {code: 'fi', name: 'Finnish', flag: '🇫🇮'},
    {code: 'pl', name: 'Polish', flag: '🇵🇱'},
    {code: 'tr', name: 'Turkish', flag: '🇹🇷'},
    {code: 'th', name: 'Thai', flag: '🇹🇭'},
    {code: 'ig', name: 'Igbo', flag: '🇳🇬'},
    {code: 'ha', name: 'Hausa', flag: '🇳🇬'},
    {code: 'yo', name: 'Yoruba', flag: '🇳🇬'},
  ];

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now2 = new Date();
    const diffInHours = (now2.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    }
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    }
    if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
    return date.toLocaleDateString();
  };

  /**
   * Chat ID generated from hostname, category and date
   * For each day, a site and it's category will have a separate chat
   */
  const generateChatId = (userId: string): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${day}_${month}_${year}`;
    const {hostname} = new URL(window.location.href);
    return `${userId}_${hostname}_${category}_${dateString}`;
  };

  // Don't you dare complain about this, you'll be fired.
  chrome.storage.sync.get('clarityUserId').then(({clarityUserId: userId}) => {
    /*
     *  Global variables
     */
    const cacheKey = `user_chats_${userId}`;
    const {hostname} = new URL(window.location.href);

    /**
     * Chat ID generated from hostname, category and date
     * For each day, a site and it's category will have a separate chat
     */
    let chatId = generateChatId(userId);

    // Track the current language state of each message
    const messageLanguageState = new Map<string, string>();

    /**
     * Language selector
     */
    const languageSelector = (id: string): string =>
      `
      <select class="translate-selector" value="${messageLanguageState.get(id) || 'en'}" id="select-${id}" data-message-id="${id}" style="
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
              ${languages.map((language) => `<option value="${language.code}">${language.flag} ${language.name}</option>`).join('')}
      </select>
    `;

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
      if (!Translator) return;

      // Update the language state for this message
      messageLanguageState.set(messageId, targetLanguage);
      // Add a translation note
      let translationNode: HTMLElement | null = document.getElementById('translation-node');
      if (!translationNode) {
        translationNode = document.createElement('div');
        translationNode.id = 'translation-node';
        translationNode.style.cssText = `
       font-size: 12px;
       color: #666;
       font-style: italic;
       margin-top: 8px;
       padding-top: 8px;
       border-top: 1px solid #e0e0e0;
     `;
        messageElement.appendChild(translationNode);
      }

      translationNode.textContent = `🌐 Translating to ${targetLanguage.toUpperCase()}...`;
      Translator.availability({
        sourceLanguage,
        targetLanguage,
      })
        .then(() => {
          Translator.create({
            sourceLanguage,
            targetLanguage,
            monitor: (m) => {
              m.addEventListener('downloadprogress', (e: any) => {
                console.log(`Downloaded ${e.loaded * 100}%`);
                if (translationNode) {
                  translationNode.textContent = `🌐 Downloading ${targetLanguage.toUpperCase()} translation...`;
                  messageElement.appendChild(translationNode);
                }
              });
            },
          }).then((translator: {translate: (text: string) => Promise<string>}) => {
            translator
              .translate(originalText)
              .then((translatedText: string) => {
                messageElement.innerHTML = translatedText;
                if (translationNode) {
                  translationNode.textContent = `🌐 Translated to ${targetLanguage.toUpperCase()}`;
                  messageElement.appendChild(translationNode);
                }
              })
              .catch((error: Error) => {
                if (translationNode) {
                  translationNode.innerHTML = `<div style="color: red;">Error translating content: ${error.message}</div>`;
                }
              });
          });
        })
        .catch((error: Error) => {
          if (translationNode) {
            translationNode.innerHTML = `<div style="color: red;">Error translating content: ${error.message}</div>`;
          }
        });
    };

    const attachEventListenersToTranslateSelector = (messages: Message[]): void => {
      messages.forEach((message) => {
        const translateSelector = document.querySelector(`[data-message-id="${message.id}"]`) as HTMLSelectElement;
        if (translateSelector) {
          translateSelector.addEventListener('change', (): void => {
            const selectedLanguage = translateSelector.value;
            if (selectedLanguage) {
              const targetMessage = document.getElementById(message.id);
              if (targetMessage) {
                // Get current language state or default to 'en'
                const currentSourceLanguage = messageLanguageState.get(message.id) || 'en';
                translateContent({
                  sourceLanguage: currentSourceLanguage,
                  targetLanguage: selectedLanguage,
                  messageElement: targetMessage,
                  originalText: message.parts.map((part) => part.text).join(''),
                  messageId: message.id,
                });
              }
              // Reset the selector
              translateSelector.value = selectedLanguage;
            }
          });
        }
      });
    };

    /**
     * History drawer helper functions
     */
    const closeHistoryDrawer = (): void => {
      const drawer = document.getElementById('history-drawer');
      const overlay = document.getElementById('drawer-overlay');

      if (drawer && overlay) {
        drawer.style.transform = 'translateX(-100%)';
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 300);
      }
    };

    const toggleHistoryDrawer = (): void => {
      const drawer = document.getElementById('history-drawer');
      const overlay = document.getElementById('drawer-overlay');

      const historyItem = document.querySelector(`.history-item[data-chat-id="${chatId}"]`);
      if (historyItem) {
        historyItem.setAttribute('data-active', 'true');
        (historyItem as HTMLElement).style.backgroundColor = '#FF4A4A';
        const titleEl = historyItem.querySelector('.history_item_text') as HTMLElement;
        const timestampEl = historyItem.querySelector('div[style*="font-size: 12px"]') as HTMLElement;
        const deleteBtn = historyItem.querySelector('.delete-btn') as HTMLElement;
        if (titleEl) titleEl.style.color = 'white';
        if (timestampEl) timestampEl.style.color = 'rgba(255, 255, 255, 0.8)';
        if (deleteBtn) deleteBtn.style.color = 'rgba(255, 255, 255, 0.8)';
      }

      if (drawer && overlay) {
        const isVisible = drawer.style.transform !== 'translateX(-100%)';

        if (isVisible) {
          // Close drawer
          drawer.style.transform = 'translateX(-100%)';
          overlay.style.display = 'none';
          overlay.style.opacity = '0';
        } else {
          // Open drawer
          overlay.style.display = 'block';
          setTimeout(() => {
            overlay.style.opacity = '1';
            drawer.style.transform = 'translateX(0)';
          }, 10);
        }
      }
    };

    /**
     * History helper functions
     */
    const renderHistoryList = (history: Array<Chat>): string => {
      if (history && history.length > 0) {
        return history
          .map((chat) => {
            const titleToDisplay = chat.title.length > 35 ? `${chat.title.slice(0, 35)}...` : chat.title;
            return `
           <div class="history-item" data-chat-id="${chat.id}" style="
             padding: 16px;
             border-bottom: 1px solid #f8f8f8;
             cursor: pointer;
             transition: background-color 0.2s;
             display: flex;
             flex-direction: column;
             position: relative;
           " onmouseover="
              const tooltip = this.querySelector('.tooltiptext'); 
             if(tooltip) { tooltip.style.visibility='visible'; 
             tooltip.style.opacity='1';}
            " 
            onmouseout="
            const tooltip = this.querySelector('.tooltiptext'); 
            if(tooltip) { tooltip.style.visibility='hidden'; 
            tooltip.style.opacity='0';}
            ">
             <div class="history_item_text" data-tooltip-id="${chat.id}" style="
               font-size: 14px;
               color: #333;
               line-height: 1.4;
               overflow: hidden;
               text-overflow: ellipsis;
               display: inline-block;
               -webkit-line-clamp: 2;
               -webkit-box-orient: vertical;
               position: relative;
               cursor: pointer;
             "onmouseover="
             const tooltip = this.querySelector('.tooltiptext'); 
             if(tooltip) { tooltip.style.visibility='visible'; 
             tooltip.style.opacity='1';}
             " onmouseout="
             const tooltip = this.querySelector('.tooltiptext'); 
             if(tooltip) { tooltip.style.visibility='hidden'; 
             tooltip.style.opacity='0';}
             ">
               ${titleToDisplay}
             </div>
             <div style="
               font-size: 12px;
               color: #999;
               display: flex;
               justify-content: space-between;
               align-items: center;
             ">
               <span>${formatTimestamp(new Date(chat.createdAt).getTime())}</span>
             </div>
             <button class="delete-btn" data-chat-id="${chat.id}" style="
               position: absolute;
               top: 12px;
               right: 12px;
               background: none;
               border: none;
               color: #999;
               cursor: pointer;
               padding: 4px;
               border-radius: 4px;
               transition: all 0.2s;
               opacity: 1;
               font-size: 16px;
             " onmouseover="this.style.color='#FF4A4A'; this.style.backgroundColor='#ffe6e6'" onmouseout="this.style.color='#999'; this.style.backgroundColor='transparent'">
               🗑️
             </button>
           </div>
         `;
          })
          .join('');
      }
      return `
         <div style="padding: 40px 20px; text-align: center; color: #666;">
           <div style="font-size: 64px; margin-bottom: 16px;">💬</div>
           <div style="font-size: 16px; margin-bottom: 8px;">No conversations yet</div>
           <div style="font-size: 14px; color: #999;">Start a chat to see your history here</div>
         </div>
       `;
    };

    const getChatHistory = (): Array<Chat> => {
      const history = localStorage.getItem(cacheKey);
      const parsedHistory = history ? JSON.parse(history) : [];
      return parsedHistory.chats;
    };

    const addNewChatToHistory = (newChat: Chat): Chat[] => {
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const data = JSON.parse(cachedData);
          // Add new chat to the top of the array
          data.chats.unshift(newChat);

          // Keep only last 50 chats
          if (data.chats.length > 50) {
            data.chats = data.chats.slice(0, 50);
          }

          data.cachedAt = Date.now(); // Update cache timestamp
          localStorage.setItem(cacheKey, JSON.stringify(data));
          const newCachedData = JSON.parse(localStorage.getItem(cacheKey) ?? JSON.stringify({chats: []}));
          return newCachedData.chats;
        } catch (error) {
          console.error('Error updating chat history cache:', error);
          return [];
        }
      } else {
        // If no cache exists, initialize with the new chat
        const newData = {
          chats: [],
          pagination: null,
          status: 'success',
          cachedAt: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(newData));
        console.log('Initialized chat history cache with new chat');
        return [];
      }
    };

    const addMessageToChat = (message: Message): void => {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        data.chats.find((v: Chat) => v.id === message.chatId).messages.push(message);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    };

    const checkForChatInHistoryByChatId = (targetChatId: string): boolean => {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        return data.chats.some((chat: {id: string}) => chat.id === targetChatId);
      }
      return false;
    };

    const replaceMessageInChatToHistory = (chat: Chat): void => {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        data.chats.find((v: {id: string}) => v.id === chat.id).messages = chat.messages;
        data.cachedAt = Date.now();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.log('Chat replaced in history cache');
      }
    };

    const attachHistoryEventListeners = (): void => {
      // Attach click listeners to history items
      document.querySelectorAll('.history-item').forEach((item: Element): void => {
        const newChatId = item.getAttribute('data-chat-id');
        if (newChatId) {
          item.addEventListener('click', (): void => {
            chatId = newChatId;
            destroyPromptSession();
            loadChatFromHistory(newChatId);
          });
        }
      });

      // Attach click listeners to delete buttons
      document.querySelectorAll('.delete-btn').forEach((btn) => {
        const id = btn.getAttribute('data-chat-id');
        if (id) {
          btn.addEventListener('click', (e: Event): void => {
            e.stopPropagation();
            destroyPromptSession();
            deleteChatFromHistory(id);
          });
        }
      });
    };

    const deleteChatFromHistory = (id: string): void => {
      const history = getChatHistory();
      const filteredHistory = history.filter((chat) => chat.id !== id);
      localStorage.setItem(cacheKey, JSON.stringify(filteredHistory));

      // Refresh the history list
      const historyList = document.getElementById('history-list');
      if (historyList) {
        const updatedHistory = getChatHistory();
        historyList.innerHTML = renderHistoryList(updatedHistory);

        // Reattach event listeners after updating the HTML
        attachHistoryEventListeners();
      }
    };

    /**
     * UI Building blocks helper functions
     */
    const chatHeader = `
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
        " 
        onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'">&times;</button>
    </div>
    `;

    const appDrawer = `
    <!-- App Drawer Overlay -->
        <div id="drawer-overlay" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 9998;
          display: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        "></div>

        <!-- App Drawer -->
        <div id="history-drawer" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 80%;
          height: 100vh;
          background: white;
          z-index: 9999;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        ">
          <!-- Drawer Header -->
          <div style="
            padding: 16px;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fafafa;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
              " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="User Profile">
                ${userId.charAt(0).toUpperCase()}
              </div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">History</h3>
            </div>
            <button id="close-drawer-btn" style="
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

          <!-- Drawer Content -->
          <div style="
            flex: 1;
            overflow-y: auto;
            padding: 0;
            display: flex;
            flex-direction: column;
          ">
            <!-- History List -->
            <div id="history-list" style="
              height: calc(100vh - 47vh);
              overflow-y: auto; 
              overflow-x: hidden; 
              padding: 0;
            ">
              ${renderHistoryList(getChatHistory())}
            </div>
            
            <!-- History Footer -->
            <div style="
              padding: 16px; 
              border-top: 1px solid #f0f0f0; 
              background-color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 72px;
              flex-shrink: 0;
            ">
              <div style="
                font-size: 12px;
                color: #999;
                text-align: center;
              ">
                <div style="margin-bottom: 4px;">📚 Chat History</div>
                <div>Scroll to see more conversations</div>
              </div>
            </div>
          </div>
        </div>`;

    const footer = `
    <!-- Input Area -->
    <div style="
      padding: 16px; 
      border-top: 1px solid #f0f0f0; 
      background-color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    ">
          <button id="hamburger-menu-btn" style="
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

    const generateLoadingIndicator = (): HTMLDivElement => {
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
      return typingIndicator;
    };

    const generateUserMessage = (content: string, timestamp: number): string => {
      return `
      <div style="
        display: flex;
        flex-direction: column;
      ">
        <div style="
            background-color: #FF4A4A; 
            color: white; 
            padding: 12px 16px; 
            border-radius: 16px 16px 4px 16px; 
            max-width: 90%; 
            align-self: flex-end;
            font-size: 14px;
            line-height: 24px;
            font-size: 0.9em !important;
          ">
            ${content}
        </div>
        <div style="
          font-size: 11px;
          color: #999;
          text-align: right;
        ">${formatTimestamp(timestamp)}</div>
      </div>
      `;
    };

    const generateResponseMessageWithoutOuterDiv = ({
      content,
      timestamp,
      id,
    }: {
      content: string;
      id: string;
      timestamp: number;
    }): string => {
      return `
      <div 
        style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
      ">
        <style>
          .clarity-content ul {
            margin: 8px 0;
            padding-left: 20px;
            font-size: 0.9em !important;
            list-style: disc !important;
          }
          .clarity-content li {
            margin: 4px 0;
          }
          .clarity-content p {
            margin: 8px 0;
            font-size: 0.9em !important;
          }
          .clarity-content b {
            font-weight: 600;
          }
          .clarity-content h1,
          .clarity-content h2 {
            font-size: 1em !important;
          }
        </style>
        <div class="clarity-content" id="${id}">
          ${content}
        </div>
      <span style="
        font-size: 11px;
        color: #999;
        margin-top: 4px;
        text-align: left;
      ">${formatTimestamp(timestamp)}</span>
      </div>
      <div style="
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #e0e0e0;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              ${languageSelector(id)}
            </div>
          </div>
    `;
    };

    const generateResponseMessage = ({
      content,
      id,
      timestamp,
      translate = true,
    }: {
      content: string;
      id: string;
      timestamp: number;
      translate?: boolean;
    }): string => {
      return `
      <div style="
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
      ">
      <div style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
          ">
            <style>
              .clarity-content ul {
                margin: 8px 0;
                padding-left: 20px;
                font-size: 0.9em !important;
                list-style: disc !important;
              }
              .clarity-content li {
                margin: 4px 0;
              }
              .clarity-content p {
                margin: 8px 0;
                font-size: 0.9em !important;
              }
              .clarity-content b {
                font-weight: 600;
              }
              .clarity-content h1,
              .clarity-content h2 {
                font-size: 1em !important;
              }
            </style>
            <div class="clarity-content" id="${id}">
              ${content}
            </div>
            <div style="
              font-size: 11px;
              color: #999;
              margin-top: 4px;
              text-align: left;
            ">${formatTimestamp(timestamp)}</div>
            <div style="
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #e0e0e0;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              ${translate ? languageSelector(id) : ''}
            </div>
          </div>
        </div>
    `;
    };

    const getChatScaffold = (content: string): string => {
      return `
        ${chatHeader}
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
          ${content}
        </div>
        ${appDrawer}
        ${footer}
      `;
    };

    const loadChatFromHistory = (newChatId: string): string | null => {
      const chatHistory = getChatHistory();
      const chat = chatHistory.find((c) => c.id === newChatId);
      if (!chat) {
        closeHistoryDrawer(); // Close the drawer after loading
        showChatUI(
          generateResponseMessage({
            content: 'Could not find chat in history',
            id: 'error_find_chat_in_history',
            timestamp: new Date().getTime(),
            translate: false,
          })
        );
        return null;
      }

      const contentTxt = chat.messages
        .map((message) => {
          if (message.role === 'user') {
            return generateUserMessage(
              message.parts.map((part) => part.text).join(''),
              new Date(message.createdAt).getTime()
            );
          }
          return generateResponseMessage({
            content: message.parts.map((part) => part.text).join(''),
            id: message.id,
            timestamp: new Date(message.createdAt).getTime(),
          });
        })
        .join('');
      closeHistoryDrawer(); // Close the drawer after loading
      showChatUI(contentTxt);
      attachEventListenersToTranslateSelector(chat.messages);
      const history = renderHistoryList(chatHistory);
      const historyList = document.getElementById('history-list');
      if (historyList) {
        historyList.innerHTML = history;
        attachHistoryEventListeners();
      }
      return contentTxt;
    };

    const handleChatWithServerLLM = (
      question: string,
      responseMessage: HTMLElement,
      chatContent: HTMLElement | null
    ): void => {
      if (!question.trim()) return;

      fetch(`${CLARITY_API_URL}/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({message: question}),
      })
        .then((response) => response.json())
        .then((result: {chat: Message}) => {
          const aiResponse = result.chat.parts.map((part) => part.text).join('');

          if (aiResponse) {
            responseMessage.innerHTML = `<div style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
          ">
            <style>
              .clarity-content ul {
                margin: 8px 0;
                padding-left: 20px;
                font-size: 0.9em !important;
                list-style: disc !important;
              }
              .clarity-content li {
                margin: 4px 0;
              }
              .clarity-content p {
                margin: 8px 0;
                font-size: 0.9em !important;
              }
              .clarity-content b {
                font-weight: 600;
              }
              .clarity-content h1,
              .clarity-content h2 {
                font-size: 1em !important;
              }
            </style>
            <div class="clarity-content" id="${result.chat.id}">
              ${aiResponse}
            </div>
            <div style="
              font-size: 11px;
              color: #999;
              margin-top: 4px;
              text-align: left;
            ">${formatTimestamp(new Date(result.chat.createdAt).getTime())}</div>
            <div style="
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #e0e0e0;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              ${languageSelector(result.chat.id)}
            </div>
          </div>`;
            const userMessage: Message = {
              chatId,
              id: result.chat.id,
              role: 'user',
              parts: [{type: 'text', text: question}],
              attachments: [],
              createdAt: new Date().toISOString(),
            };

            // Add event listener for this specific message's translate button
            attachEventListenersToTranslateSelector([userMessage, result.chat]);

            addMessageToChat(userMessage);
            addMessageToChat(result.chat);
          } else {
            responseMessage.innerHTML = generateResponseMessage({
              content: "<p style='color: red;'>I'm sorry, I couldn't generate a response for that.</p>",
              id: 'error_generate_response',
              timestamp: new Date().getTime(),
              translate: false,
            });
          }
        })
        .catch((error) => {
          console.log('🚀 ~ handleChat ~ error:', error);
          responseMessage.innerHTML = generateResponseMessage({
            content: "<p style='color: red;'>An error occurred. Please try again.</p>",
            id: 'error_generate_response',
            timestamp: new Date().getTime(),
            translate: false,
          });
        })
        .finally(() => {
          if (chatContent) {
            chatContent.scrollTop = chatContent.scrollHeight;
          }
        });
    };

    let promptSession: any;
    const handleChatWithChromeLLM = ({
      question,
      responseMessage,
      chatContent,
      previousMessages,
    }: {
      question: string;
      responseMessage: HTMLElement;
      chatContent: HTMLElement | null;
      previousMessages: Message[];
    }): void => {
      if (!LanguageModel) return;
      if (!promptSession) {
        LanguageModel.availability({}).then((availability) => {
          if (availability === 'unavailable') {
            responseMessage.innerHTML = generateResponseMessage({
              content: 'Language model is unavailable',
              id: 'error_language_model_unavailable',
              timestamp: new Date().getTime(),
              translate: false,
            });
            throw new Error('Language model is unavailable');
          }
        });
        LanguageModel.create({
          initialPrompts: [
            ...previousMessages.map((message) => ({
              role: message.role as LanguageModelMessageRole,
              content: message.parts.map((part) => part.text).join(''),
            })),
          ],
        }).then((model) => {
          promptSession = model;
          model.prompt(question).then((response) => {
            const message: Message = {
              id: `assistant_response_${new Date().getTime()}`,
              role: 'assistant' as const,
              parts: [{type: 'text', text: response}],
              attachments: [],
              createdAt: new Date().toISOString(),
              chatId: chatId,
            };
            responseMessage.innerHTML = generateResponseMessageWithoutOuterDiv({
              content: response,
              id: message.id,
              timestamp: new Date().getTime(),
            });
            if (chatContent) {
              chatContent.scrollTop = chatContent.scrollHeight;
            }
            attachEventListenersToTranslateSelector([message]);
            // TODO: Save the message to the database
          });
        });
      } else {
        promptSession.prompt(question).then((response: string) => {
          const message: Message = {
            id: `assistant_response_${new Date().getTime()}`,
            role: 'assistant' as const,
            parts: [{type: 'text', text: response}],
            attachments: [],
            createdAt: new Date().toISOString(),
            chatId: chatId,
          };
          responseMessage.innerHTML = generateResponseMessageWithoutOuterDiv({
            content: response,
            id: message.id,
            timestamp: new Date().getTime(),
          });
          if (chatContent) {
            chatContent.scrollTop = chatContent.scrollHeight;
          }
          attachEventListenersToTranslateSelector([message]);
          // TODO: Save the message to the database
        });
      }
    };

    const destroyPromptSession = (): void => {
      if (promptSession) {
        promptSession.destroy();
        promptSession = null;
      }
    };

    const handleChat = (question: string): void => {
      if (!question.trim()) return;

      // Create user message bubble
      const userMessage = document.createElement('div');
      userMessage.innerHTML = generateUserMessage(question, new Date().getTime());
      const chatContent = document.getElementById('chat-content');
      if (chatContent) {
        chatContent.appendChild(userMessage);
      }

      const chatInput = document.getElementById('chat-input') as HTMLInputElement;
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
        max-width: 90%; 
        align-self: flex-start;
        font-size: 14px;
        line-height: 24px;
        color: #333;
        margin-bottom: 16px;
        position: relative;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-align: left;
        font-size: 0.9em !important;
      `;

      responseMessage.appendChild(generateLoadingIndicator());
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

      chrome.storage.sync.get('llmProvider').then(({llmProvider}) => {
        if (llmProvider === 'server') {
          handleChatWithServerLLM(question, responseMessage, chatContent);
        } else {
          handleChatWithChromeLLM({
            question,
            responseMessage,
            chatContent,
            previousMessages: [
              {
                id: 'system_message',
                parts: [
                  {
                    type: 'text',
                    text: 'You are a helpful assistant summarizing boring legal pages like Terms of Service and Privacy Policies in a way a 5-year-old can understand. Be short, simple, and straight to the point. Return your response as well-formatted HTML starting from a <div>, without including <html>, <head>, or <body> tags.',
                  },
                ],
                attachments: [],
                createdAt: new Date().toISOString(),
                chatId: chatId,
                role: 'system' as const,
              },
              ...(getChatHistory().find((c) => c.id === chatId)?.messages || []),
            ],
          });
        }
      });
    };

    const showChatUI = (content: string): void => {
      let chatUI = document.getElementById('tos-gpt-chat-ui');

      if (!chatUI) {
        // Add Urbanist font
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        chatUI = document.createElement('div');
        chatUI.id = 'tos-gpt-chat-ui';
        chatUI.style.cssText = `
              position: fixed;
              bottom: 20px;
              right: 20px;
              cursor: auto !important;
              width: 375px !important;
              height: 600px !important;
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

      chatUI.innerHTML = getChatScaffold(content);
      attachHistoryEventListeners();

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

          // Destroy the prompt session
          destroyPromptSession();
        });
      }

      // Hamburger menu functionality (only the main input area button)
      const hamburgerBtn = document.getElementById('hamburger-menu-btn');
      if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleHistoryDrawer);
      }

      // Close drawer button functionality
      const closeDrawerBtn = document.getElementById('close-drawer-btn');
      if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeHistoryDrawer);
      }

      // Close drawer when clicking overlay
      const overlay = document.getElementById('drawer-overlay');
      if (overlay) {
        overlay.addEventListener('click', closeHistoryDrawer);
      }

      // Close drawer when clicking outside
      document.addEventListener('click', (e: Event) => {
        const drawer = document.getElementById('history-drawer');
        const hamburgerBtn2 = document.getElementById('hamburger-menu-btn');
        const isClickOnHamburger = hamburgerBtn2 && hamburgerBtn2.contains(e.target as Node);

        if (drawer && !drawer.contains(e.target as Node) && !isClickOnHamburger) {
          closeHistoryDrawer();
        }
      });

      const chatInput = document.getElementById('chat-input') as HTMLInputElement;
      const chatSendBtn = document.getElementById('chat-send-btn');

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

    const serverSummarize = ({
      url,
      messageElement,
      contentCategory,
      userMessage,
    }: {
      url: string;
      messageElement: HTMLElement;
      contentCategory: string;
      userMessage: string;
    }): void => {
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
          message: userMessage,
        }),
      })
        .then((response) => response.json())
        .then((result: {chat: Chat}) => {
          if (result.chat) {
            // This use case rarely occurs
            if (checkForChatInHistoryByChatId(result.chat.id)) {
              // Replace existing chat in history
              replaceMessageInChatToHistory(result.chat);
            } else {
              // Add new chat to history
              // We are saving the entire chat to the history since we didn't save when the chat was created
              const chats = addNewChatToHistory(result.chat);
              const history = renderHistoryList(chats);
              const historyList = document.getElementById('history-list');
              if (historyList) {
                historyList.innerHTML = history;
                attachHistoryEventListeners();
              }
            }
          }
          /*
           * Since this function is called only when a new chat is created,
           * We will only render the message from the assistant.
           */
          const assistantMessage = result.chat.messages.find((message: {role: string}) => message.role === 'assistant');

          if (!assistantMessage) {
            messageElement.innerHTML = `<div style="color: red;">We could not generate a response for that.</div>`;
            return;
          }

          // Generate unique ID for this message
          const messageId = assistantMessage.id;
          // Initialize language state for this message (default to 'en')
          messageLanguageState.set(messageId, 'en');

          /*
           * With multiple parts and multi modal support,
           * This will be re-implemented in the future.
           */
          const messageParts = assistantMessage.parts.map((part: {text: string}) => part.text).join(' ');

          messageElement.innerHTML = generateResponseMessageWithoutOuterDiv({
            content: messageParts,
            id: messageId,
            timestamp: new Date(assistantMessage.createdAt).getTime(),
          });

          // Add event listener for this specific message's translate button
          attachEventListenersToTranslateSelector([assistantMessage]);
        })
        .catch((error: Error) => {
          messageElement.innerHTML = `<div style="color: red;">Error summarizing content: ${error.message}</div>`;
        });
    };

    if (!userId) {
      showChatUI('Please sign in to use Clarity.');
      return;
    }

    /**
     * Find the link for the given terms
     * Start of something else
     */
    // TODO: Handle the case where there is no external link
    let internalLink = externalLink!;

    //  Try to get the link from localStorage which was stored by the ContentScript
    const cachePolicy = localStorage.getItem(`${hostname}_${category}`);
    if (cachePolicy) {
      const policy = JSON.parse(cachePolicy);
      internalLink = policy.link;
    }

    // If no link found in localStorage, show error
    if (!internalLink) {
      showChatUI(
        generateResponseMessage({
          content: `<p style="color: red;">Link for ${category} of ${hostname} not on the current page and not in our database yet.</p>`,
          id: 'error_find_link',
          timestamp: new Date().getTime(),
          translate: false,
        })
      );
      return;
    }

    // If chat exists in history, show it and load messages from history
    if (checkForChatInHistoryByChatId(chatId)) {
      const chat = getChatHistory().find((c) => c.id === chatId);
      if (!chat) {
        showChatUI(
          generateResponseMessage({
            content: `<p style="color: red;">Could not find chat in history.</p>`,
            id: 'error_find_chat_in_history',
            timestamp: new Date().getTime(),
            translate: false,
          })
        );
        return;
      }

      // Generate the content of the chat
      const contentTxt = chat.messages
        .map((message) => {
          if (message.role === 'user') {
            return generateUserMessage(
              message.parts.map((part) => part.text).join(''),
              new Date(message.createdAt).getTime()
            );
          }
          return generateResponseMessage({
            content: message.parts.map((part) => part.text).join(''),
            id: message.id,
            timestamp: new Date(message.createdAt).getTime(),
          });
        })
        .join('');
      showChatUI(contentTxt);
      attachEventListenersToTranslateSelector(chat.messages);
      return;
    }

    // If no chat exists in history, start a new chat
    showChatUI('');

    const chatContent = document.getElementById('chat-content');
    if (!chatContent) {
      showChatUI(
        generateResponseMessage({
          content: `<p style="color: red;">Could not find chat content</p>`,
          id: 'error_find_chat_content',
          timestamp: new Date().getTime(),
          translate: false,
        })
      );
      return;
    }

    const userMessage = document.createElement('div');
    const userInput = `Tell me about the ${category} of <a href="${internalLink}" target="_blank">${hostname}</a>.`;
    userMessage.innerHTML = generateUserMessage(
      userInput,
      new Date().getTime()
    );
    userMessage.id = 'initial-user-message';
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
      font-size: 0.9em !important;
    `;
    responseMessage.appendChild(generateLoadingIndicator());
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

    const browserSummarize = ({
      link,
      responseElement,
      category,
      userMessage,
    }: {
      link: string;
      responseElement: HTMLElement;
      category: string;
      userMessage: string;
    }): void => {
      fetch(`${CLARITY_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link,
          // domain: origin,
          type: category,
          userId,
          chatId,
          message: userMessage,
          title: userMessage,
        }),
      })
        .then((response) => response.json())
        .then((result: {chat: Chat}) => {
          if (!result.chat) {
            showChatUI(
              generateResponseMessage({
                content: `<p style="color: red;">Error creating chat</p>`,
                id: 'error_create_chat',
                timestamp: new Date().getTime(),
                translate: false,
              })
            );
            return;
          }

          const chat = result.chat;
          const systemMessages = chat.messages
            .filter((message) => message.role === 'system')
            .map((message) => ({
              role: message.role as LanguageModelMessageRole,
              content: message.parts.map((part) => part.text).join(''),
            }));

          const messages = chat.messages.filter((message) => message.role !== 'system');
          chat.messages = messages;
          const history = renderHistoryList([chat]);
          const historyList = document.getElementById('history-list');
          if (historyList) {
            historyList.innerHTML = history;
          }

          if (!LanguageModel) return;

          if (!promptSession) {
            LanguageModel.availability({}).then((availability) => {
              if (availability === 'unavailable') {
                responseMessage.innerHTML = generateResponseMessage({
                  content: 'Language model is unavailable',
                  id: 'error_language_model_unavailable',
                  timestamp: new Date().getTime(),
                  translate: false,
                });
                throw new Error('Language model is unavailable');
              }
            });
            LanguageModel.create({
              initialPrompts: systemMessages,
            }).then((model) => {
              promptSession = model;
              model.prompt(userMessage).then((response) => {
                const message: Message = {
                  id: `assistant_response_${new Date().getTime()}`,
                  role: 'assistant' as const,
                  parts: [{type: 'text', text: response}],
                  attachments: [],
                  createdAt: new Date().toISOString(),
                  chatId: chatId,
                };
                responseElement.innerHTML = generateResponseMessageWithoutOuterDiv({
                  content: response,
                  id: message.id,
                  timestamp: new Date().getTime(),
                });
                if (chatContent) {
                  chatContent.scrollTop = chatContent.scrollHeight;
                }
                attachEventListenersToTranslateSelector([message]);

                fetch(`${CLARITY_API_URL}/chat/message/${chatId}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({content: response, role: 'assistant', chatId: chatId}),
                })
                  .then((response) => response.json())
                  .then((result: {message: Message}) => {
                    chat.messages.push(result.message);
                    addNewChatToHistory(chat);
                  });
              });
            });
          }
        })
        .catch((error) => {
          console.log('Browser summarize error:', error);
        });
    };

    chrome.storage.sync.get('llmProvider').then(({llmProvider}) => {
      if (llmProvider === 'server') {
        serverSummarize({
          url: internalLink,
          messageElement: responseMessage,
          contentCategory: category,
          userMessage: userMessage.innerText,
        });
      } else {
        browserSummarize({
          link: internalLink,
          responseElement: responseMessage,
          category,
          userMessage: userMessage.innerText,
        });
      }
    });
  });
};

export default clarity;
