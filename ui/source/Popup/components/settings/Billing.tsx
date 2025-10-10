import * as React from 'react';
import {User} from '../../api';
import {SettingsTabType} from '.';

interface BillingProps {
  user: User | undefined;
  isLoading: boolean;
  isFetching: boolean;
  switchTab: (tab: SettingsTabType) => void;
}

export const Billing = ({user, switchTab}: BillingProps): React.ReactElement => {
  //   const [plan, setPlan] = React.useState('free');
  //   const [billingCycle, setBillingCycle] = React.useState('monthly');

  const onUpgrade = (plan: 'pro' | 'team'): void => {
    if (!user || !user.email || !user.name) {
      switchTab('accounts');
      return;
    }

    switchTab('billing');
    switch (plan) {
      case 'pro':
        break;
      case 'team':
        break;
    }
  };

  return (
    <div className="settings-content">
      <div className="settings-section">
        <h3>Current Plan</h3>
        <div className="plan-card">
          <div className="plan-header">
            <h4>Free Plan</h4>
            <span className="plan-status active">Active</span>
          </div>
          <div className="plan-features">
            <ul>
              <li>✓ 10 analyses per month</li>
              <li>✓ Basic summaries</li>
              <li>✓ Standard languages</li>
              <li>✗ Advanced AI features</li>
              <li>✗ Priority support</li>
            </ul>
          </div>
          <div className="plan-usage">
            <div className="usage-item">
              <span>Analyses this month</span>
              <span>3 / 10</span>
            </div>
            <div className="usage-bar">
              <div className="usage-progress" style={{width: '30%'}} />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Upgrade Options</h3>
        <div className="upgrade-options">
          <div className="upgrade-card">
            <h4>Pro Plan</h4>
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">9</span>
              <span className="period">/month</span>
            </div>
            <ul className="features">
              <li>✓ Unlimited analyses</li>
              <li>✓ Advanced AI summaries</li>
              <li>✓ All languages</li>
              <li>✓ Export capabilities</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="upgrade-button" type="button" onClick={() => onUpgrade('pro')}>
              Upgrade to Pro
            </button>
          </div>

          <div className="upgrade-card featured">
            <div className="featured-badge">Most Popular</div>
            <h4>Team Plan</h4>
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">29</span>
              <span className="period">/month</span>
            </div>
            <ul className="features">
              <li>✓ Everything in Pro</li>
              <li>✓ Team collaboration</li>
              <li>✓ Custom integrations</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Dedicated support</li>
            </ul>
            <button className="upgrade-button primary" type="button" onClick={() => onUpgrade('team')}>
              Upgrade to Team
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Billing History</h3>
        <div className="billing-history">
          <div className="history-item">
            <div className="history-date">Dec 2024</div>
            <div className="history-description">Free Plan</div>
            <div className="history-amount">$0.00</div>
          </div>
          <div className="history-item">
            <div className="history-date">Nov 2024</div>
            <div className="history-description">Free Plan</div>
            <div className="history-amount">$0.00</div>
          </div>
        </div>
        <button className="setting-button secondary" type="button">
          View all billing history
        </button>
      </div>
    </div>
  );
};
