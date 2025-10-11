import * as React from 'react';
import {TabType} from '..';

export interface FooterItem {
  id: TabType;
  icon: string;
  label: string;
}
export const Footer = ({
  handleTabClick,
  activeTab,
}: {
  handleTabClick: (tab: TabType) => void;
  activeTab: TabType;
}): React.ReactElement => {

  const footerItems: FooterItem[] = [
    {id: 'home', icon: '🏠', label: 'Home'},
    {id: 'chat', icon: '💬', label: 'Chat'},
    {id: 'settings', icon: '⚙️', label: 'Settings'},
  ];

  return (
    <div className="footer">
      {footerItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => handleTabClick(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
