import {browser} from 'webextension-polyfill-ts';
import Scrapper from '../common/scrapper';
import {Policy} from '../common/types/index.d';
import {CLARITY_API_URL, CLARITY_TOKEN_KEY, CLARITY_USER_ID_KEY} from '../common/constants';
import { getSetting, SETTINGS_KEYS } from '../common/utils';

// Chat history caching utilities
const getUserId = async (): Promise<string | null> => {
  try {
    const result = await browser.storage.sync.get(CLARITY_USER_ID_KEY);
    return result[CLARITY_USER_ID_KEY] || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

const getAutoAnalyzePreference = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.sync.get(SETTINGS_KEYS.AUTO_ANALYZE);
    return result[SETTINGS_KEYS.AUTO_ANALYZE] || false;
  } catch (error) {
    console.error('Error getting auto analyze preference:', error);
    return false;
  }
};

const isCacheValid = (cachedData: string): boolean => {
  try {
    const data = JSON.parse(cachedData);
    const cacheTime = data.cachedAt;
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    return now - cacheTime < maxAge;
  } catch {
    return false;
  }
};

const initializeChatHistory = async (): Promise<void> => {
  const userId = await getUserId();
  if (!userId) {
    console.log('No user ID found, skipping chat history initialization');
    return;
  }

  const cacheKey = `user_chats_${userId}`;

  // Check if we have valid cached data in localStorage
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData && isCacheValid(cachedData)) {
    console.log('Using cached chat history from localStorage');
    return;
  }

  // No valid cache found, fetch from API and store in localStorage
  try {
    console.log('No valid cache found, fetching chat history from API...');
    const token = await getSetting(CLARITY_TOKEN_KEY, '');
    const response = await fetch(`${CLARITY_API_URL}/chat/history/${userId}?page=1&limit=50`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });


    if (response.ok) {
      const data = await response.json();
      // Extract chats array from the response and store with timestamp
      const dataWithTimestamp = {
        chats: data.chats || [],
        pagination: data.pagination || null,
        status: data.status || 'success',
        cachedAt: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(dataWithTimestamp));
      console.log('Chat history fetched and cached in localStorage');
    } else {
      // Initialize with empty array if fetch fails
      const emptyData = {
        chats: [],
        pagination: null,
        status: 'error',
        cachedAt: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(emptyData));
    }
  } catch (error) {
    // Initialize with empty array if fetch fails
    const emptyData = {
      chats: [],
      pagination: null,
      status: 'error',
      cachedAt: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(emptyData));
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addNewChatToHistory = async (newChat: any): Promise<void> => {
  const userId = await getUserId();
  if (!userId) return;

  const cacheKey = `user_chats_${userId}`;
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
      console.log('New chat added to history cache');
    } catch (error) {
      console.error('Error updating chat history cache:', error);
    }
  } else {
    // If no cache exists, initialize with the new chat
    const newData = {
      chats: [newChat],
      pagination: null,
      status: 'success',
      cachedAt: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(newData));
    console.log('Initialized chat history cache with new chat');
  }
};

let observer: MutationObserver | null = null;
let isProcessing = false;
let debounceTimer: NodeJS.Timeout | null = null;
let currentDomain = '';

// Function to get policy from localStorage or fetch from server
const getOrFetchPolicy = async ({
  element,
  type,
}: {
  element: HTMLAnchorElement;
  type: 'privacy' | 'terms';
}): Promise<Policy | null> => {
  const {hostname: hrefHostname, origin: domain} = new URL(element.href);
  const hrefStorageKey = `${hrefHostname}_${type}`;
  const errorKey = `${hrefStorageKey}_error`;

  /**
   * I want to store and retrieve data from localStorage for the current domain.
   * The problem is most terms and policies are in subdomains.
   * The patch is to store terms and policies that is a subdomain of the current domain.
   */

  // Start of Patch variable name
  const {hostname} = new URL(window.location.href);
  const patchStorageKey = `${hostname}_${type}`;

  // Patch retrieve data from localStorage
  const patchPolicy = localStorage.getItem(patchStorageKey);
  if (patchPolicy) {
    return JSON.parse(patchPolicy);
  }

  // First check localStorage
  const cachedPolicy = localStorage.getItem(hrefStorageKey);
  if (cachedPolicy) {
    return JSON.parse(cachedPolicy);
  }

  const cachedError = localStorage.getItem(errorKey);
  if (cachedError) {
    return null;
  }

  const autoAnalyze = await getAutoAnalyzePreference();
  if (!autoAnalyze) {
    return null;
  }

  // If not in cache, fetch from server
  try {
    const response = await fetch(`${CLARITY_API_URL}/scout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({domain, link: element.href, type}),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();

    // Store policy in localStorage for caching
    if (result.policy) {
      localStorage.setItem(hrefStorageKey, JSON.stringify(result.policy));
      if (
        Scrapper.DEFAULT_KEYWORDS[type].some((keyword) =>
          element.innerText.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        localStorage.setItem(patchStorageKey, JSON.stringify(result.policy));
      }
    }

    return result.policy;
  } catch (error: unknown) {
    localStorage.setItem(errorKey, 'error');
    console.error(`Error fetching/creating ${type} policy:`, error);
    return null;
  }
};

const processElements = async (): Promise<void> => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const elements = await Scrapper.findElement();

    // Only add indicators if we found elements
    if (elements.terms.length > 0 || elements.privacy.length > 0) {
      // Add indicators next to found elements
      Scrapper.addIndicatorsToElements(elements);

      // Fetch or create policies for found links
      const policyPromises: Promise<Policy | null>[] = [];

      // Process privacy policy links
      elements.privacy.forEach((element) => {
        if (element.href) {
          policyPromises.push(getOrFetchPolicy({element, type: 'privacy'}));
        }
      });

      // Process terms of service links
      elements.terms.forEach((element) => {
        if (element.href) {
          policyPromises.push(getOrFetchPolicy({element, type: 'terms'}));
        }
      });

      // Wait for all policy requests to complete
      await Promise.allSettled(policyPromises);
    }
  } catch (error) {
    console.error('Error in content script:', error);
  } finally {
    isProcessing = false;
  }
};

const debouncedProcessElements = (): void => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    processElements();
  }, 1000); // 1 second debounce
};

const main = async (): Promise<void> => {
  // Initialize current domain
  const {hostname} = Scrapper.getCurrentUrl();
  currentDomain = hostname;

  // Initialize chat history (hybrid approach)
  await initializeChatHistory();

  // Initial attempt
  await processElements();

  // Set up retry mechanism for SPAs
  await Scrapper.retryWithDelay(processElements, 10, 2000);

  // Set up MutationObserver for dynamic content changes
  observer = Scrapper.startSPAObserver(debouncedProcessElements);
};

// Handle SPA navigation (for sites like X.com that change URL without full page reload)
const handleNavigation = (): void => {
  const {hostname} = Scrapper.getCurrentUrl();

  // Only process if domain has changed
  if (hostname !== currentDomain) {
    currentDomain = hostname;

    // Disconnect existing observer
    if (observer) {
      observer.disconnect();
    }

    // Clear any pending debounced calls
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Restart the process for new domain
    setTimeout(main, 1000);
  }
};

// Listen for URL changes (common in SPAs)
let currentUrl = window.location.href;
const checkForNavigation = (): void => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    handleNavigation();
  }
};

// Check for navigation every 2 seconds
setInterval(checkForNavigation, 2000);

// Listen for messages from clarity module
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;

  if (event.data.type === 'ADD_CHAT_TO_HISTORY') {
    await addNewChatToHistory(event.data.chat);
  }
});

// Wait for DOM to be ready before running
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (observer) {
    observer.disconnect();
  }
});

// Export functions for use in other parts of the extension
export {addNewChatToHistory, initializeChatHistory};
