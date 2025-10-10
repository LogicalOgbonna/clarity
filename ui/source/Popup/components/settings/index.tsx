import * as React from 'react';

import './styles.scss';
import {General} from './General';
import {Billing} from './Billing';
import {Accounts} from './Accounts';
import {useQuery} from 'react-query';
import {getUserByBrowserId} from '../../api';

export type SettingsTabType = 'general' | 'billing' | 'accounts';

export const Settings = (): React.ReactElement => {
  const [activeTab, setActiveTab] = React.useState<SettingsTabType>('accounts');

  const {data, isLoading, isFetching} = useQuery({
    queryKey: ['user-data'],
    queryFn: getUserByBrowserId,
    onSuccess: (data) => {
      console.log('data:');
      console.log(data);
    },
  });

  const handleTabClick = (tab: SettingsTabType): void => {
    setActiveTab(tab);
  };

  const tabs: Record<SettingsTabType, React.ReactElement> = {
    general: <General />,
    billing: <Billing user={data?.user} isLoading={isLoading} isFetching={isFetching} switchTab={handleTabClick} />,
    accounts: <Accounts user={data?.user} isLoading={isLoading} isFetching={isFetching} />,
  };

  const settingsTabs: Array<{id: SettingsTabType; label: string}> = [
    {id: 'general', label: 'General'},
    {id: 'billing', label: 'Billing'},
    {id: 'accounts', label: 'Accounts'},
  ];

  return (
    <div className="settings">
      <div className="settings-navigation">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="settings-content-wrapper">{tabs[activeTab]}</div>
    </div>
  );
};
