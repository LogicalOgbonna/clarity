import * as React from 'react';

import './styles.scss';
import Layout, {type TabType} from './layout';
import {Home} from './components/home';
import {ChatComponent} from './components/chat';
import {Settings} from './components/settings';
import {QueryClient, QueryClientProvider} from 'react-query';

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('home');
  const queryClient = new QueryClient();
  const handleTabClick = (tab: TabType): void => {
    setActiveTab(tab);
  };

  const tabs: Record<TabType, React.ReactElement> = {
    home: <Home />,
    chat: <ChatComponent />,
    settings: <Settings />,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Layout handleTabClick={handleTabClick}>{tabs[activeTab]}</Layout>
    </QueryClientProvider>
  );
};

export default Popup;
