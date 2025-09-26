import * as React from 'react';

import './styles.scss';
import Layout, {type TabType} from './layout';
import {Home} from './components/home';

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('home');
  const handleTabClick = (tab: TabType): void => {
    setActiveTab(tab);
  };

  const tabs: Record<TabType, React.ReactElement> = {
    home: <Home />,
    chat: <div>Chat</div>,
    settings: <div>Settings</div>,
  };

  return <Layout handleTabClick={handleTabClick}>{tabs[activeTab]}</Layout>;
};

export default Popup;
