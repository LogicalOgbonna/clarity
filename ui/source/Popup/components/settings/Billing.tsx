import * as React from 'react';
import {Plan, User} from '../../api';
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

    switch (plan) {
      case 'pro':
        break;
      case 'team':
        break;
    }
  };

  const isFreePlan = user?.plan === 'free';
  const isProPlan = user?.plan === 'pro';
  const isTeamPlan = user?.plan === 'team';

  const planFeatures: Record<Plan, React.ReactNode> = {
    free: (
      <ul style={{outline: 'none'}}>
        <li>✓ 10 analyses per month</li>
        <li>✓ Basic summaries</li>
        <li>✓ Standard languages</li>
        <li>✗ Advanced AI features</li>
        <li>✗ Priority support</li>
      </ul>
    ),
    pro: (
      <ul style={{outline: 'none'}}>
        <li>✓ Unlimited analyses</li>
        <li>✓ Advanced AI summaries</li>
        <li>✓ All languages</li>
        <li>✓ Export capabilities</li>
        <li>✓ Priority support</li>
      </ul>
    ),
    team: (
      <ul style={{outline: 'none'}}>
        <li>✓ Everything in Pro</li>
        <li>✓ Team collaboration</li>
        <li>✓ Custom integrations</li>
        <li>✓ Advanced analytics</li>
        <li>✓ Dedicated support</li>
      </ul>
    ),
  };

  const planPrice: Record<Plan, string> = {
    pro: '$9',
    team: '$29',
    free: '$0',
  };

  const planUsage: Record<Plan, string> = {
    pro: 'Unlimited',
    team: 'Unlimited',
    free: '10',
  };

  return (
    <div className="settings-content">
      <div className="settings-section">
        <h3>Current Plan</h3>
        <div className="plan-card">
          <div className="plan-header">
            <h4>{user?.plan} Plan</h4>
            <span className="plan-status active">Active</span>
          </div>
          <div className="plan-features">{planFeatures[user?.plan || 'free']}</div>
          <div className="plan-usage">
            <div className="usage-item">
              <span>Analyses this month</span>
              <span>
                {user?.numberOfSummaries || 0} / {planUsage[user?.plan || 'free']}
              </span>
            </div>
            {isFreePlan && (
              <div className="usage-bar">
                <div
                  className="usage-progress"
                  style={{
                    width: `${((user?.numberOfSummaries || 0) / Number(planUsage[user?.plan || 'free'])) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Upgrade Options</h3>
        <div className="upgrade-options">
          {!isProPlan && (
            <div className="upgrade-card">
              <h4>Pro Plan</h4>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{planPrice['pro']}</span>
                <span className="period">/month</span>
              </div>
              <ul className="features">{planFeatures['pro']}</ul>
              <button className="upgrade-button" type="button" onClick={() => onUpgrade('pro')}>
                Upgrade to Pro
              </button>
            </div>
          )}

          {!isTeamPlan && (
            <div className="upgrade-card featured">
              <div className="featured-badge">Most Popular</div>
              <h4>Team Plan</h4>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{planPrice['team']}</span>
                <span className="period">/month</span>
              </div>
              <ul className="features">{planFeatures['team']}</ul>
              <button className="upgrade-button primary" type="button" onClick={() => onUpgrade('team')}>
                Upgrade to Team
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h3>Billing History</h3>
        {/* <div className="billing-history">
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
        </button> */}
      </div>
    </div>
  );
};
