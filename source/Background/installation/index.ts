import {browser} from 'webextension-polyfill-ts';
import {fetchDefaultLinks, getBrowserId} from '../api';
import {setUpContextMenus} from '../context/base';

/**
 * On installed, set up the context menus, get the default links and the browser ID
 * @returns {Promise<void>}
 */
browser.runtime.onInstalled.addListener(async (): Promise<void> => {
  await fetchDefaultLinks();
  await getBrowserId();
  setUpContextMenus();
});
