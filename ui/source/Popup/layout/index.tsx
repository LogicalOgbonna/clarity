import * as React from 'react';
import {landingPageQuery, PolicyCount, User} from '../api';
import {useQuery} from 'react-query';

import {Header} from './components/header';
import {Footer} from './components/footer';

export type TabType = 'home' | 'chat' | 'settings';

export default function Layout({
  children,
}: {
  children: (data: {tab: TabType; user?: User; policyCount?: PolicyCount; isLoading: boolean; isFetching: boolean}) => React.ReactNode;
}): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<TabType>('home');
  const {data, isLoading, isFetching} = useQuery({
    queryKey: ['landing-page-data'],
    queryFn: landingPageQuery,
    staleTime: 1000 * 60 * 5,
  });
  const [policyCount, user] = data || [];

  return (
    <section id="popup">
      <Header policyCount={policyCount} />
      <div className="content">
        {children({
          tab: activeTab,
          user: user?.user,
          policyCount: policyCount,
          isLoading,
          isFetching,
        })}
      </div>
      <Footer handleTabClick={setActiveTab} activeTab={activeTab} />
    </section>
  );
}
