import {browser} from 'webextension-polyfill-ts';
import clarity from '../../common/clarity';

/**
 * On context menu clicked, handle the context menu click
 * @param {ContextMenuClickedEvent} event
 * @returns {Promise<void>}
 */
browser.contextMenus.onClicked.addListener(async (event, tab) => {
  if (!tab?.id) return;
  switch (event.menuItemId) {
    case 'privacy_summary_terms_of_service':
      await browser.scripting.executeScript({
        target: {tabId: tab.id},
        func: clarity,
        args: ['terms', null],
      });
      break;
    case 'privacy_summary_privacy_policy':
      await browser.scripting.executeScript({
        target: {tabId: tab.id},
        func: clarity,
        args: ['privacy', null],
      });
      break;
    default:
      break;
  }
});
