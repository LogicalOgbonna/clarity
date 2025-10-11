import * as React from 'react';

import './styles.scss';
import Layout, {type TabType} from './layout';
import {Home} from './components/home';
import {ChatComponent} from './components/chat';
import {Settings} from './components/settings';
import {User} from './api';

import {Providers} from './providers';
const Popup: React.FC = (): React.ReactElement => {

  const renderTab = ({
    tab,
    user,
    isLoading,
    isFetching,
  }: {
    tab: TabType;
    user?: User;
    isLoading: boolean;
    isFetching: boolean;
  }): React.ReactElement => {
    switch (tab) {
      case 'home':
        return <Home user={user} isLoading={isLoading} isFetching={isFetching} />;
      case 'chat':
        return <ChatComponent user={user} isLoading={isLoading} isFetching={isFetching} />;
      case 'settings':
        return <Settings user={user} isLoading={isLoading} isFetching={isFetching} />;
    }
  };

  return (
    <Providers>
      <Layout>
        {(data) => renderTab(data)}
      </Layout>
    </Providers>
  );
};

export default Popup;
