import {browser} from 'webextension-polyfill-ts';
import clarity from '../clarity';

type PrivacyLink = {
  privacy: Array<{
    [key: string]: string;
  }>;
};

type TermsLink = {
  terms: Array<{
    [key: string]: string;
  }>;
};

class Scrapper {
  public static DEFAULT_KEYWORDS = {
    terms: ['terms', 'terms of service', 'terms of use', 'terms of conditions'],
    privacy: ['privacy', 'privacy policy', 'privacy notice'],
  };

  public static getCurrentUrl = (): {
    hostname: string;
    host: string;
    pathname: string;
  } => {
    const {hostname, host, pathname} = new URL(window.location.href);
    return {hostname: hostname.replace('www.', ''), host, pathname};
  };

  public static isValidUrl = (url: string): boolean => {
    try {
      const {hash} = new URL(url);
      return !!hash;
    } catch (error) {
      console.log('🚀 ~ isValidUrl ~ error:', error);
      return false;
    }
  };

  public static findElement = async (): Promise<{
    terms: HTMLAnchorElement[];
    privacy: HTMLAnchorElement[];
  }> => {
    const {hostname} = this.getCurrentUrl();
    const {privacy}: PrivacyLink = (await browser.storage.sync.get(
      'privacy'
    )) as PrivacyLink;

    const {terms}: TermsLink = (await browser.storage.sync.get(
      'terms'
    )) as TermsLink;
    const privacyServerLink = privacy?.[
      hostname as keyof typeof privacy
    ] as unknown as string | undefined;
    const termsServerLink = terms?.[
      hostname as keyof typeof terms
    ] as unknown as string | undefined;

    const aTags = document.querySelectorAll('a[href]');
    const foundTerms: HTMLAnchorElement[] = [];
    const foundPrivacy: HTMLAnchorElement[] = [];

    // First, try to find links using server-provided URLs
    if (privacyServerLink || termsServerLink) {
      Array.from(aTags).forEach((value: Element) => {
        const {href} = value as HTMLAnchorElement;
        if (privacyServerLink && href.includes(privacyServerLink)) {
          foundPrivacy.push(value as HTMLAnchorElement);
        }
        if (termsServerLink && href.includes(termsServerLink)) {
          foundTerms.push(value as HTMLAnchorElement);
        }
      });
    }

    // If no server links found or no matches, fall back to keyword matching
    if (foundTerms.length === 0 && foundPrivacy.length === 0) {
      Array.from(aTags).forEach((value: Element) => {
        const anchor = value as HTMLAnchorElement;
        const textContent = anchor.textContent?.toLowerCase() || '';
        const href = anchor.href?.toLowerCase() || '';

        // Check for terms keywords
        for (const keyword of this.DEFAULT_KEYWORDS.terms) {
          if (
            textContent.includes(keyword.toLowerCase()) ||
            href.includes(keyword.toLowerCase())
          ) {
            foundTerms.push(anchor);
            break;
          }
        }

        // Check for privacy keywords
        for (const keyword of this.DEFAULT_KEYWORDS.privacy) {
          if (
            textContent.includes(keyword.toLowerCase()) ||
            href.includes(keyword.toLowerCase())
          ) {
            foundPrivacy.push(anchor);
            break;
          }
        }
      });
    }

    return {
      terms: foundTerms,
      privacy: foundPrivacy,
    };
  };

  public static createIndicatorElement = (
    type: 'terms' | 'privacy'
  ): HTMLElement => {
    const indicator = document.createElement('span');
    indicator.className = `extension-indicator extension-${type}`;
    indicator.textContent = type === 'terms' ? '📋' : '🔒';
    indicator.title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
    indicator.style.cssText = `
      margin-left: 4px;
      margin-top: auto;
      margin-bottom: auto;
      font-size: 14px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      vertical-align: baseline;
      display: inline;
      line-height: inherit;
      position: relative;
    `;

    indicator.addEventListener('mouseenter', () => {
      indicator.style.opacity = '1';
    });

    indicator.addEventListener('mouseleave', () => {
      indicator.style.opacity = '0.7';
    });

    return indicator;
  };

  public static hasIndicator = (element: HTMLElement): boolean => {
    // Check if the element itself has an indicator
    if (element.querySelector('.extension-indicator')) {
      return true;
    }

    // Check if there's an indicator next to this element
    const {nextSibling} = element;
    if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
      const nextElement = nextSibling as Element;
      if (nextElement.classList.contains('extension-indicator')) {
        return true;
      }
    }

    // Check if there's an indicator in the parent's children
    const parent = element.parentNode;
    if (parent) {
      const siblings = Array.from(parent.childNodes);
      const elementIndex = siblings.indexOf(element);

      // Check the next sibling
      if (elementIndex >= 0 && elementIndex < siblings.length - 1) {
        const nextSiblingNode = siblings[elementIndex + 1];
        if (nextSiblingNode.nodeType === Node.ELEMENT_NODE) {
          const nextElement = nextSiblingNode as Element;
          if (nextElement.classList.contains('extension-indicator')) {
            return true;
          }
        }
      }
    }

    return false;
  };

  public static cleanupDuplicateIndicators = (): void => {
    // Remove all existing indicators
    const existingIndicators = document.querySelectorAll(
      '.extension-indicator'
    );
    existingIndicators.forEach((indicator) => {
      indicator.remove();
    });
  };

  public static addIndicatorsToElements = (elements: {
    terms: HTMLAnchorElement[];
    privacy: HTMLAnchorElement[];
  }): void => {
    // Clean up any existing indicators first to prevent duplicates
    this.cleanupDuplicateIndicators();

    // Add indicators to terms elements
    elements.terms.forEach((element) => {
      const indicator = this.createIndicatorElement('terms');

      // Add click event listener to call clarity function
      indicator.addEventListener('click', async () => {
        try {
          // Get the link from the anchor element
          const link = element.href;

          // Call clarity function with 'terms' category and the link
          clarity('terms', false, undefined, link);
        } catch (error) {
          console.error('Error calling clarity for terms:', error);
        }
      });

      // Try to insert after the element, but ensure proper alignment
      if (element.parentNode) {
        element.parentNode.insertBefore(indicator, element.nextSibling);
      }
    });

    // Add indicators to privacy elements
    elements.privacy.forEach((element) => {
      const indicator = this.createIndicatorElement('privacy');

      // Add click event listener to call clarity function
      indicator.addEventListener('click', async () => {
        try {
          // Get the link from the anchor element
          const link = element.href;

          // Call clarity function with 'privacy' category and the link
          clarity('privacy', false, undefined, link);
        } catch (error) {
          console.error('Error calling clarity for privacy:', error);
        }
      });

      // Try to insert after the element, but ensure proper alignment
      if (element.parentNode) {
        element.parentNode.insertBefore(indicator, element.nextSibling);
      }
    });
  };

  public static startSPAObserver = (callback: () => void): MutationObserver => {
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;

      mutations.forEach((mutation) => {
        // Check if new nodes were added
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any of the added nodes contain anchor tags
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'A' || element.querySelector('a[href]')) {
                shouldCheck = true;
              }
            }
          });
        }
      });

      if (shouldCheck) {
        // Debounce the callback to avoid excessive calls
        setTimeout(callback, 500);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  };

  public static retryWithDelay = async (
    callback: () => Promise<void>,
    maxRetries = 10,
    delay = 2000
  ): Promise<void> => {
    let retries = 0;

    const attempt = async (): Promise<void> => {
      try {
        await callback();
        const elements = await this.findElement();

        // If we found elements, we're done
        if (elements.terms.length > 0 || elements.privacy.length > 0) {
          return;
        }

        // If no elements found and we have retries left, try again
        if (retries < maxRetries) {
          retries += 1;
          setTimeout(attempt, delay);
        } else {
          console.log('🚀 ~ Max retries reached, stopping search');
        }
      } catch (error) {
        console.log('🚀 ~ Error in retry attempt:', error);
        if (retries < maxRetries) {
          retries += 1;
          setTimeout(attempt, delay);
        }
      }
    };

    await attempt();
  };
}

export default Scrapper;
