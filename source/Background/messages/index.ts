import {browser} from 'webextension-polyfill-ts';

/**
 * On message, handle the message
 * @param {Message} message
 * @returns {Promise<void>}
 */
browser.runtime.onMessage.addListener((message) => {
  console.log('🚀 ~ message:', message);
});
