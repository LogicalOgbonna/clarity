import * as React from 'react';

export type TabType = 'home' | 'chat' | 'settings';

export interface FooterItem {
  id: TabType;
  icon: string;
  label: string;
}
const Header = (): React.ReactElement => {
  return (
    <div className="header">
      <div className="logo-section">
        <div className="logo">C</div>
        <h2>Clarity</h2>
      </div>
      {/* <button className="menu-button" title="Menu">
    ⋯
  </button> */}
    </div>
  );
};

const Footer = ({
  handleTabClick,
}: {
  handleTabClick: (tab: TabType) => void;
}): React.ReactElement => {
  const [activeTab, setActiveTab] = React.useState<TabType>('home');

  const footerItems: FooterItem[] = [
    {id: 'home', icon: '🏠', label: 'Home'},
    {id: 'chat', icon: '💬', label: 'Chat'},
    {id: 'settings', icon: '⚙️', label: 'Settings'},
  ];

  const onTabClick = (tab: TabType): void => {
    setActiveTab(tab);
    handleTabClick(tab);
  };

  return (
    <div className="footer">
      {footerItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabClick(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function Layout({
  children,
  handleTabClick,
}: {
  children: React.ReactNode;
  handleTabClick: (tab: TabType) => void;
}): React.ReactElement {
  return (
    <section id="popup">
      <Header />
      <div className="content">{children}</div>
      <Footer handleTabClick={handleTabClick} />
    </section>
  );
}
