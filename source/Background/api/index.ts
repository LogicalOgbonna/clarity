import {browser} from 'webextension-polyfill-ts';

export const fetchDefaultLinks = async (): Promise<{
  privacy: string[];
  terms: string[];
}> => {
  try {
    const response = await fetch('http://localhost:5005/api/defaultLinks');
    const data = await response.json();
    await browser.storage.sync.set({privacy: data.privacy, terms: data.terms});
    return data;
  } catch (error) {
    console.error('Error fetching default links:', error);
    return {privacy: [], terms: []};
  }
};
