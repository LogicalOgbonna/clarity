import Scrapper from '../common/scrapper';
import {Policy} from '../common/types/index.d';

const API_URL = 'http://localhost:3000/api';

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

  // If not in cache, fetch from server
  try {
    const response = await fetch(`${API_URL}/policy/fetch-or-create`, {
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

export {};
