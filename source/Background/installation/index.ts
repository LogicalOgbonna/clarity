import {browser} from 'webextension-polyfill-ts';
import {getBrowserId} from '../api';
import {setUpContextMenus} from '../context/base';

/**
 * On installed, set up the context menus and get the browser ID
 * Note: Default links are now fetched dynamically per page instead of on install
 * @returns {Promise<void>}
 */
browser.runtime.onInstalled.addListener(async (): Promise<void> => {
  await getBrowserId();
  setUpContextMenus();
});
