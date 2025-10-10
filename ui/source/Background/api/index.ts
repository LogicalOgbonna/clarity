import {browser} from 'webextension-polyfill-ts';
import {CLARITY_API_URL, CLARITY_BROWSER_ID_KEY} from '../../common/constants';

const getBrowserId = async (): Promise<void> => {
  const existing = await browser.storage.sync.get(CLARITY_BROWSER_ID_KEY);
  if (existing.clarityBrowserId) {
    return;
  }
  const clarityBrowserId = crypto.randomUUID();
  try {
    const response = await fetch(`${CLARITY_API_URL}/user/browser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({browserId: clarityBrowserId}),
    });
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const {
      user: {id: clarityUserId},
    } = await response.json();
    await browser.storage.sync.set({clarityBrowserId});
    await browser.storage.sync.set({clarityUserId});
  } catch (error) {
    console.error('Error getting browser ID:', error);
  }
};
export {getBrowserId};
