import * as React from 'react';

import './styles.scss';
import {General} from './General';
import {Billing} from './Billing';
import {Accounts} from './Accounts';

type SettingsTabType = 'general' | 'billing' | 'accounts';

export const Settings = (): React.ReactElement => {
  const [activeTab, setActiveTab] = React.useState<SettingsTabType>('general');

  const handleTabClick = (tab: SettingsTabType): void => {
    setActiveTab(tab);
  };

  const tabs: Record<SettingsTabType, React.ReactElement> = {
    general: <General />,
    billing: <Billing />,
    accounts: <Accounts />,
  };

  const settingsTabs = [
    {id: 'general' as SettingsTabType, label: 'General'},
    {id: 'billing' as SettingsTabType, label: 'Billing'},
    {id: 'accounts' as SettingsTabType, label: 'Accounts'},
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
