import Scrapper from '../common/scrapper';

let observer: MutationObserver | null = null;
let isProcessing = false;
let debounceTimer: NodeJS.Timeout | null = null;

const processElements = async (): Promise<void> => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const elements = await Scrapper.findElement();

    // Only add indicators if we found elements
    if (elements.terms.length > 0 || elements.privacy.length > 0) {
      // Add indicators next to found elements
      Scrapper.addIndicatorsToElements(elements);
    }
  } catch (error) {
    // console.log('🚀 ~ Error in content script:', error);
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
  // Initial attempt
  await processElements();

  // Set up retry mechanism for SPAs
  await Scrapper.retryWithDelay(processElements, 10, 2000);

  // Set up MutationObserver for dynamic content changes
  observer = Scrapper.startSPAObserver(debouncedProcessElements);
};

// Handle SPA navigation (for sites like X.com that change URL without full page reload)
const handleNavigation = (): void => {
  // Disconnect existing observer
  if (observer) {
    observer.disconnect();
  }

  // Clear any pending debounced calls
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Restart the process
  setTimeout(main, 1000);
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
