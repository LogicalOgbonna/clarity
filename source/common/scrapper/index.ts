import {browser} from 'webextension-polyfill-ts';

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
    terms: HTMLElement | null;
    privacy: HTMLElement | null;
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
    const set = new Map();

    if (!privacyServerLink || !termsServerLink) {
      return {
        terms: null,
        privacy: null,
      };
    }

    Array.from(aTags).forEach((value: Element) => {
      const {href} = value as HTMLAnchorElement;
      if (href.includes(privacyServerLink)) {
        set.set('privacy', value);
      }
      if (href.includes(termsServerLink)) {
        set.set('terms', value);
      }
    });
    return {
      terms: set.get('terms'),
      privacy: set.get('privacy'),
    };
  };
}

export default Scrapper;
// const findElement = async (): Promise<{
//   terms: HTMLElement | null;
//   privacy: HTMLElement | null;
// }> => {
//   // TODO: improve this function to find the best match
//   /** use the links that were returned from the server if available to search the DOM
//    * otherwise, find the element for the given terms
//    */
//   const privacyLinks: Record<string, string[]> = await browser.storage.sync.get('privacy');
//   const termsLinks: Record<string, string[]> = await browser.storage.sync.get('terms');

//   const {hostname} = getCurrentUrl();

//   const privacyServerLink = privacyLinks.privacy[hostname];
//   const termsServerLink = termsLinks.terms[hostname];

//   if (
//     (privacyServerLink && isValidUrl(privacyServerLink)) ||
//     (termsServerLink && isValidUrl(termsServerLink))
//   ) {
//     const set = new Map();
//     Array.from(document.querySelectorAll('a[href]'))
//       .filter((a) => {
//         return (
//           a.href?.toLowerCase().includes(privacyServerLink.toLowerCase()) ||
//           a.href?.toLowerCase().includes(termsServerLink.toLowerCase())
//         );
//       })
//       .forEach((a) => {
//         if (a.href.toLowerCase().includes(termsServerLink.toLowerCase())) {
//           set.set('terms', a);
//         }
//         if (a.href.toLowerCase().includes(privacyServerLink.toLowerCase())) {
//           set.set('privacy', a);
//         }
//       });

//     if (set.size > 0) {
//       return {
//         terms: set.get('terms'),
//         privacy: set.get('privacy'),
//       };
//     }
//   }

//   const terms = [...DEFAULT_KEYWORDS.terms, ...DEFAULT_KEYWORDS.privacy];
//   const set = new Map();
//   for (const term of terms) {
//     Array.from(document.querySelectorAll('a[href]'))
//       .filter((a) => {
//         return a.textContent.toLowerCase().includes(term.toLowerCase()) && a.href;
//       })
//       .forEach((a) => {
//         if (a.textContent.toLowerCase().includes('terms')) {
//           set.set('terms', a);
//         }
//         if (a.textContent.toLowerCase().includes('privacy')) {
//           set.set('privacy', a);
//         }
//       });
//   }

//   return {
//     terms: set.get('terms'),
//     privacy: set.get('privacy'),
//   };
// };
