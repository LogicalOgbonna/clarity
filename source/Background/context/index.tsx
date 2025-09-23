import {browser} from 'webextension-polyfill-ts';
import clarity from '../clarity';

/**
 * On context menu clicked, handle the context menu click
 * @param {ContextMenuClickedEvent} event
 * @returns {Promise<void>}
 */
browser.contextMenus.onClicked.addListener(async (event, tab) => {
  if (!tab?.id) return;
  switch (event.menuItemId) {
    case 'privacy_summary_terms_of_service':
      {
        let termsToSend: string[] = [];
        const terms = await browser.storage.sync.get('terms');
        if (terms?.terms) {
          termsToSend = terms?.terms;
        }
        await browser.scripting.executeScript({
          target: {tabId: tab.id},
          func: clarity,
          args: ['terms', termsToSend],
        });
      }
      break;
    case 'privacy_summary_privacy_policy':
      {
        let privacyToSend: string[] = [];
        const privacy = await browser.storage.sync.get('privacy');
        if (privacy?.privacy) {
          privacyToSend = privacy?.privacy;
        }
        await browser.scripting.executeScript({
          target: {tabId: tab.id},
          func: clarity,
          args: ['privacy', privacyToSend],
        });
      }
      break;
    default:
      break;
  }
});
