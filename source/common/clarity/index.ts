// Note: Chat history will be handled via message passing to avoid isolation issues

// Declare Summarizer as a global object
declare const Summarizer: {
  availability({
    monitor,
  }: {
    monitor?: (m: EventTarget) => void;
  }): Promise<string>;
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
    monitor: (m: EventTarget) => void;
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
  Translator: typeof Translator;
};

type Message = {
  chatId: string;
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: {
    type:
      | 'text'
      | 'reasoning'
      | 'source-url'
      | 'source-document'
      | 'file'
      | 'step-start'
      | 'step-end';
    text: string;
  }[];
  attachments: unknown[];
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
  // Don't you dare complain about this, you'll be fired.
  chrome.storage.sync.get('clarityUserId').then(({clarityUserId: userId}) => {
    /*
     *  Global variables
     */
    const cacheKey = `user_chats_${userId}`;
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
    let chatId = `${hostname}_${category}_${dateString}`;

    // Track the current language state of each message
    const messageLanguageState = new Map<string, string>();

    /**
     * Language selector
     */
    const languageSelector = (id: string): string =>
      `
      <select class="translate-selector" id="select-${id}" data-message-id="${id}" style="
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
      if (!self.Translator) return;

      // Update the language state for this message
      messageLanguageState.set(messageId, targetLanguage);
      // Add a translation note
      let translationNode: HTMLElement | null =
        document.getElementById('translation-node');
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
        monitor(m) {
          // TODO: add a monitor for the Translator model that displays the progress in chat
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          m.addEventListener('downloadprogress', (e: any) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
          });
        },
      })
        .then(() => {
          Translator.create({
            sourceLanguage,
            targetLanguage,
          }).then(
            (translator: {translate: (text: string) => Promise<string>}) => {
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
            }
          );
        })
        .catch((error: Error) => {
          if (translationNode) {
            translationNode.innerHTML = `<div style="color: red;">Error translating content: ${error.message}</div>`;
          }
        });
    };

    const attachEventListenersToTranslateSelector = (
      messages: Message[]
    ): void => {
      messages.forEach((message) => {
        const translateSelector = document.querySelector(
          `[data-message-id="${message.id}"]`
        ) as HTMLSelectElement;
        if (translateSelector) {
          translateSelector.addEventListener('change', (): void => {
            const selectedLanguage = translateSelector.value;
            if (selectedLanguage) {
              const targetMessage = document.getElementById(message.id);
              if (targetMessage) {
                // Get current language state or default to 'en'
                const currentSourceLanguage =
                  messageLanguageState.get(message.id) || 'en';
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
      if (history.length > 0) {
        return history
          .slice()
          .reverse()
          .map((chat) => {
            const titleToDisplay =
              chat.title.length > 28
                ? `${chat.title.slice(0, 28)}...`
                : chat.title;
            const needsTooltip = chat.title.length > 28;
            return `
           <div class="history-item" data-chat-id="${chat.id}" style="
             padding: 16px;
             border-bottom: 1px solid #f8f8f8;
             cursor: pointer;
             transition: background-color 0.2s;
             display: flex;
             flex-direction: column;
             gap: 4px;
             position: relative;
           " onmouseover="
              this.style.backgroundColor='#f5f5f5';
              const tooltip = this.querySelector('.tooltiptext'); 
             if(tooltip) { tooltip.style.visibility='visible'; 
             tooltip.style.opacity='1';}
            " 
            onmouseout="this.style.backgroundColor='transparent';
            const tooltip = this.querySelector('.tooltiptext'); 
            if(tooltip) { tooltip.style.visibility='hidden'; 
            tooltip.style.opacity='0';}
            ">
             <div class="tooltip" data-tooltip-id="${chat.id}" style="
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
                 ${
                   needsTooltip
                     ? `<span class="tooltiptext" style="
                   visibility: hidden;
                   width: 200px;
                   background-color: #333;
                   color: white;
                   text-align: center;
                  border-radius: 6px;
                   padding: 2px 4px;
                   position: absolute;
                   z-index: 99999;
                   top: -5px;
                   left: 0px;
                   font-size: 12px;
                   line-height: 1.4;
                   word-wrap: break-word;
                   white-space: normal;
                   opacity: 0;
                   transition: opacity 0.3s;
                   pointer-events: none;
                 ">${chat.title}</span>`
                     : ''
                 }
             </div>
             <div style="
               font-size: 12px;
               color: #999;
               display: flex;
               justify-content: space-between;
               align-items: center;
             ">
               <span>${formatTimestamp(new Date(chat.createdAt).getTime())}</span>
               <span style="
                 background: #f0f0f0;
                 color: #666;
                 padding: 2px 6px;
                 border-radius: 4px;
                 font-size: 10px;
               ">${hostname}</span>
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
          const newCachedData = JSON.parse(
            localStorage.getItem(cacheKey) ?? JSON.stringify({chats: []})
          );
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
        data.chats
          .find((v: Chat) => v.id === message.chatId)
          .messages.push(message);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    };

    const checkForChatInHistoryByUserId = (targetChatId: string): boolean => {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        return data.chats.some(
          (chat: {id: string}) => chat.id === targetChatId
        );
      }
      return false;
    };

    const replaceMessageInChatToHistory = (chat: Chat): void => {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        data.chats.find((v: {id: string}) => v.id === chat.id).messages =
          chat.messages;
        data.cachedAt = Date.now();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.log('Chat replaced in history cache');
      }
    };

    const attachHistoryEventListeners = ({
      loadChatFromHistory,
      deleteChatFromHistory,
    }: {
      deleteChatFromHistory: (
        id: string,
        loadChatFromHistory: (newChatId: string) => void
      ) => void;
      loadChatFromHistory: (newChatId: string) => void;
    }): void => {
      // Attach click listeners to history items
      document
        .querySelectorAll('.history-item')
        .forEach((item: Element): void => {
          const newChatId = item.getAttribute('data-chat-id');
          if (newChatId) {
            item.addEventListener('click', (): void => {
              chatId = newChatId;
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
            deleteChatFromHistory(id, loadChatFromHistory);
          });
        }
      });
    };

    const deleteChatFromHistory = (
      id: string,
      loadChatFromHistory: (newChatId: string) => void
    ): void => {
      const history = getChatHistory();
      const filteredHistory = history.filter((chat) => chat.id !== id);
      console.log(
        '🚀 ~ deleteChatFromHistory ~ filteredHistory:',
        filteredHistory
      );
      localStorage.setItem(cacheKey, JSON.stringify(filteredHistory));

      // Refresh the history list
      const historyList = document.getElementById('history-list');
      if (historyList) {
        const updatedHistory = getChatHistory();
        historyList.innerHTML = renderHistoryList(updatedHistory);

        // Reattach event listeners after updating the HTML
        attachHistoryEventListeners({
          loadChatFromHistory,
          deleteChatFromHistory,
        });
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
          " onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'">&times;</button>
        </div>`;

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
                ${hostname.charAt(0).toUpperCase()}
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
          ">
            <!-- History List -->
            <div id="history-list" style="padding: 0; overflow-y: auto; height: 600px; overflow-x: hidden; margin: 0 0 20px 0;">
              ${renderHistoryList(getChatHistory())}
            </div>
            <!-- History Footer -->
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
    const generateUserMessage = (content: string): string => {
      return `
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
      `;
    };

    const generateResponseMessage = ({
      content,
      id,
    }: {
      content: string;
      id: string;
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
            <div class="clarity-content" id="${id}">
              ${content}
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

    const showChatUI = (content: string): void => {
      let chatUI = document.getElementById('tos-gpt-chat-ui');

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
        const chatContent = document.getElementById('chat-content');
        if (chatContent) {
          chatContent.appendChild(userMessage);
        }

        const chatInput = document.getElementById(
          'chat-input'
        ) as HTMLInputElement;
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

        fetch(`${CLARITY_API_URL}/chat/${chatId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({message: question}),
        })
          .then((response) => response.json())
          .then((result: {chat: Message}) => {
            const aiResponse = result.chat.parts
              .map((part) => part.text)
              .join('');

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
              <div class="clarity-content" id="${result.chat.id}">
                ${aiResponse}
              </div>
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

              // Add event listener for this specific message's translate button
              attachEventListenersToTranslateSelector([result.chat]);

              addMessageToChat(result.chat);
            } else {
              responseMessage.innerHTML = generateResponseMessage({
                content:
                  "<p style='color: red;'>I'm sorry, I couldn't generate a response for that.</p>",
                id: 'error_generate_response',
              });
            }
          })
          .catch((error) => {
            console.log('🚀 ~ handleChat ~ error:', error);
            responseMessage.innerHTML = generateResponseMessage({
              content:
                "<p style='color: red;'>An error occurred. Please try again.</p>",
              id: 'error_generate_response',
            });
          })
          .finally(() => {
            if (chatContent) {
              chatContent.scrollTop = chatContent.scrollHeight;
            }
          });
      };

      // Load chat from history
      // TODO: Simplify and possible extract outside of showChatUI
      const loadChatFromHistory = (newChatId: string): string | null => {
        const chat = getChatHistory().find((c) => c.id === newChatId);
        if (chat) {
          const contentTxt = chat.messages
            .map((message) => {
              if (message.role === 'user') {
                return generateUserMessage(
                  message.parts.map((part) => part.text).join('')
                );
              }
              return generateResponseMessage({
                content: message.parts.map((part) => part.text).join(''),
                id: message.id,
              });
            })
            .join('');
          closeHistoryDrawer(); // Close the drawer after loading
          showChatUI(contentTxt);
          attachEventListenersToTranslateSelector(chat.messages);
          return contentTxt;
        }

        closeHistoryDrawer(); // Close the drawer after loading
        showChatUI(
          generateResponseMessage({
            content: 'Could not find chat in history',
            id: 'error_find_chat_in_history',
          })
        );
        return null;
      };

      // Delete chat from history

      // Attach event listeners to the history list
      attachHistoryEventListeners({
        loadChatFromHistory,
        deleteChatFromHistory,
      });

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
        ${getChatScaffold(content)}    
      `;
      attachHistoryEventListeners({
        loadChatFromHistory,
        deleteChatFromHistory,
      });

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
        const isClickOnHamburger =
          hamburgerBtn2 && hamburgerBtn2.contains(e.target as Node);

        if (
          drawer &&
          !drawer.contains(e.target as Node) &&
          !isClickOnHamburger
        ) {
          closeHistoryDrawer();
        }
      });

      const chatInput = document.getElementById(
        'chat-input'
      ) as HTMLInputElement;
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
      // If no cached content, proceed with API call
      fetch(`${CLARITY_API_URL}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link: url,
          domain: hostname,
          type: contentCategory,
          userId,
          chatId,
          message: userMessage,
        }),
      })
        .then((response) => response.json())
        .then((result: {chat: Chat}) => {
          if (result.chat && checkForChatInHistoryByUserId(result.chat.id)) {
            // Replace existing chat in history
            replaceMessageInChatToHistory(result.chat);
          } else if (result.chat) {
            // Add new chat to history
            const chats = addNewChatToHistory(result.chat);
            const history = renderHistoryList(chats);
            const historyList = document.getElementById('history-list');
            if (historyList) {
              historyList.innerHTML = history;
            }
          }

          /*
           * Since this function is called only when a new chat is created,
           * We will only render the message from the assistant.
           */

          const assistantMessage = result.chat.messages.find(
            (message: {role: string}) => message.role === 'assistant'
          );

          // TODO: Handle the case where there is no assistant message
          if (!assistantMessage) {
            messageElement.innerHTML = `<div style="color: red;">Error summarizing content: No assistant message found</div>`;
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
          const messageParts = assistantMessage.parts
            .map((part: {text: string}) => part.text)
            .join(' ');

          messageElement.innerHTML = `<div style="
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
              ${messageParts}
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
          </div>`;

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
      showChatUI(
        generateResponseMessage({
          content: `Could not find a link for ${category} of ${hostname}.`,
          id: 'error_find_link',
        })
      );
      return;
    }

    if (checkForChatInHistoryByUserId(chatId)) {
      const chat = getChatHistory().find((c) => c.id === chatId);
      if (chat) {
        const contentTxt = chat.messages
          .map((message) => {
            if (message.role === 'user') {
              return generateUserMessage(
                message.parts.map((part) => part.text).join('')
              );
            }
            return generateResponseMessage({
              content: message.parts.map((part) => part.text).join(''),
              id: message.id,
            });
          })
          .join('');
        showChatUI(contentTxt);
        attachEventListenersToTranslateSelector(chat.messages);
        return;
      }

      showChatUI(
        generateResponseMessage({
          content: 'Could not find chat in history.',
          id: 'error_find_chat_in_history',
        })
      );
      return;
    }

    showChatUI('');

    const chatContent = document.getElementById('chat-content');
    if (!chatContent) {
      showChatUI(
        generateResponseMessage({
          content: 'Could not find chat content',
          id: 'error_find_chat_content',
        })
      );
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
          Summarizer.availability({
            monitor: (m: EventTarget) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              m.addEventListener('downloadprogress', (e: any) => {
                console.log(`Downloaded ${e.loaded * 100}%`);
              });
            },
          }).then((status: string) => {
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
              monitor(m: EventTarget): void {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                m.addEventListener('downloadprogress', (e: any) => {
                  console.log(`Downloaded ${e.loaded * 100}%`);
                });
              },
            };

            Summarizer.create(options).then(
              (summarizer: {summarize: (text: string) => Promise<string>}) => {
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
                        translateSelector.addEventListener(
                          'change',
                          (): void => {
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
                          }
                        );
                      }
                    })
                    .catch((error: unknown) => {
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
                        translateSelector.addEventListener(
                          'change',
                          (): void => {
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
                          }
                        );
                      }
                    })
                    .catch((error: unknown) => {
                      console.error('Error processing full text:', error);
                    });
                }
              }
            );
          });
        })
        .catch((error) => {
          console.error('Browser summarize error:', error);
        });
    };

    if (userId === null) {
      browserSummarize(internalLink, responseMessage);
      return;
    }

    serverSummarize({
      url: internalLink,
      messageElement: responseMessage,
      contentCategory: category,
      userMessage: userMessage.innerText,
    });
  });
};

export default clarity;
