import {browser} from 'webextension-polyfill-ts';
import type {Menus} from 'webextension-polyfill-ts';
import {SETTINGS_KEYS, fetchPrompt} from '../../common/utils';

const PRIMARY_CONTEXT_MENU_CONTENTS = [
  {
    title: 'Clarity',
    type: 'normal',
    id: 'privacy_summary_menu',
    children: [
      {
        title: 'Terms',
        type: 'normal',
        id: 'privacy_summary_terms_of_service',
      },
      {
        title: 'Privacy',
        type: 'normal',
        id: 'privacy_summary_privacy_policy',
      },
    ],
  },
];

export const setUpContextMenus = (): void => {
  PRIMARY_CONTEXT_MENU_CONTENTS.forEach((command) => {
    browser.contextMenus.create({
      title: command.title,
      type: command.type as Menus.ItemType,
      id: command.id,
      contexts: ['page'],
    });

    if (command.children) {
      command.children.forEach((child) => {
        browser.contextMenus.create({
          title: child.title,
          type: child.type as Menus.ItemType,
          id: child.id,
          contexts: ['page'],
          parentId: command.id,
        });
      });
    }
  });
};

export const setDefaultSettings = async () => {
  await browser.storage.sync.set({
    [SETTINGS_KEYS.LANGUAGE]: 'en',
    [SETTINGS_KEYS.AUTO_ANALYZE]: true,
    [SETTINGS_KEYS.LLM_PROVIDER]: 'chrome',
    [SETTINGS_KEYS.CHROME_CONFIG]: {
      temperature: 1,
      topK: 3,
    },
    [SETTINGS_KEYS.THEME]: 'auto',
    [SETTINGS_KEYS.NOTIFICATIONS]: false,
  });
  try {
    const {terms, privacy} = await fetchPrompt();
    await browser.storage.sync.set({
      [SETTINGS_KEYS.TERMS_PROMPT]: terms,
      [SETTINGS_KEYS.PRIVACY_PROMPT]: privacy,
    });
  } catch (error) {
    console.error('Failed to set default settings:', error);
  }
};
