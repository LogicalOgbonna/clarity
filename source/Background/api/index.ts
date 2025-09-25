import {browser} from 'webextension-polyfill-ts';

const API_URL = 'http://localhost:3000/api';

type Policy = {
  id: number;
  domain: string;
  link: string;
  type: string;
  version: string;
  content: string;
  datePublished: Date;
  createdAt: Date;
  updatedAt: Date;
};

const fetchDefaultLinks = async (): Promise<{
  policies: Policy[];
}> => {
  try {
    const response = await fetch(`${API_URL}/policy`);
    const {policies}: {policies: Policy[]} = await response.json();
    const privacy: Array<{
      [key: string]: string;
    }> = [];
    const terms: Array<{
      [key: string]: string;
    }> = [];
    policies.forEach((policy) => {
      if (policy.type === 'privacy') {
        privacy.push({[policy.link]: policy.link});
      } else if (policy.type === 'terms') {
        terms.push({[policy.link]: policy.link});
      }
    });
    await browser.storage.sync.set({privacy, terms});
    return {policies};
  } catch (error) {
    console.error('Error fetching default links:', error);
    return {policies: []};
  }
};

const getBrowserId = async (): Promise<void> => {
  const existing = await browser.storage.sync.get('browserId');
  if (existing.browserId) {
    return;
  }
  const browserId = crypto.randomUUID();
  try {
    const response = await fetch(`${API_URL}/browserId`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({browserId}),
    });
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    await browser.storage.sync.set({browserId});
  } catch (error) {
    console.error('Error getting browser ID:', error);
  }
};
export {fetchDefaultLinks, getBrowserId};
