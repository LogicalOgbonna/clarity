import {browser} from 'webextension-polyfill-ts';
import {fetchDefaultLinks} from '../api';
import {setUpContextMenus} from '../context/base';

/**
 * On installed, set up the context menus, get the default links and the browser ID
 * @returns {Promise<void>}
 */
browser.runtime.onInstalled.addListener(async (): Promise<void> => {
  await fetchDefaultLinks();
  setUpContextMenus();
});
