import * as React from 'react';

import './styles.scss';

type TabType = 'home' | 'chat' | 'settings';

interface FooterItem {
  id: TabType;
  icon: string;
  label: string;
}

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('home');

  const footerItems: FooterItem[] = [
    {id: 'home', icon: '🏠', label: 'Home'},
    {id: 'chat', icon: '💬', label: 'Chat'},
    {id: 'settings', icon: '⚙️', label: 'Settings'},
  ];

  const handleTabClick = (tab: TabType): void => {
    setActiveTab(tab);
  };

  return (
    <section id="popup">
      {/* Header */}
      <div className="header">
        <div className="logo-section">
          <div className="logo">C</div>
          <h2>Clarity</h2>
        </div>
        {/* <button className="menu-button" title="Menu">
          ⋯
        </button> */}
      </div>

      {/* Content Area */}
      <div className="content">
        <div className="welcome-section">
          <span className="icon">💬</span>
          <div className="title">Welcome to Clarity</div>
          <div className="subtitle">Your AI-powered terms analyzer</div>
        </div>

        <ul className="feature-list">
          <li>
            <div className="feature-icon">📄</div>
            <div className="feature-text">Analyze Terms of Service</div>
          </li>
          <li>
            <div className="feature-icon">🔍</div>
            <div className="feature-text">Get instant summaries</div>
          </li>
          <li>
            <div className="feature-icon">🌐</div>
            <div className="feature-text">Multi-language support</div>
          </li>
          <li>
            <div className="feature-icon">💾</div>
            <div className="feature-text">Save chat history</div>
          </li>
        </ul>
      </div>

      {/* Footer Navigation */}
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
    </section>
  );
};

export default Popup;
