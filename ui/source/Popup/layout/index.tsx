import * as React from 'react';
import {getUserByBrowserId, User} from '../api';
import {useQuery} from 'react-query';

import {Header} from './components/header';
import {Footer} from './components/footer';

export type TabType = 'home' | 'chat' | 'settings';

export default function Layout({
  children,
}: {
  children: (data: {tab: TabType; user?: User; isLoading: boolean; isFetching: boolean}) => React.ReactNode;
}): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<TabType>('home');
  const {data, isLoading, isFetching} = useQuery({
    queryKey: ['user-data'],
    queryFn: getUserByBrowserId,
    staleTime: 1000 * 60 * 5,
  });
  return (
    <section id="popup">
      <Header />
      <div className="content">
        {children({
          tab: activeTab,
          user: data?.user,
          isLoading,
          isFetching,
        })}
      </div>
      <Footer handleTabClick={setActiveTab} activeTab={activeTab} />
    </section>
  );
}
