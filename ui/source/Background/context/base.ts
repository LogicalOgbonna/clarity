import {browser} from 'webextension-polyfill-ts';
import type {Menus} from 'webextension-polyfill-ts';

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
