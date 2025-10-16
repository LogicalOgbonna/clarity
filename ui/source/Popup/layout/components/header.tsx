import * as React from 'react';
import {PolicyCount} from '../../api';
import {TabType} from '..';

export const Header = ({
  policyCount,
  tab,
  onSignUp,
  isSignedIn,
  isLoading,
}: {
  policyCount?: PolicyCount;
  tab: TabType;
  onSignUp: (tab: TabType) => void;
  isSignedIn: boolean;
  isLoading: boolean;
}): React.ReactElement => {
  const privacyCount = policyCount?.privacy ?? 0;
  const termsCount = policyCount?.terms ?? 0;
  const isHomeTab = tab === 'home' || tab === 'settings';

  return (
    <div className="header">
      <div className="logo-section">
        <div className="logo">C</div>
        <h2>Clarity</h2>
      </div>
      {(privacyCount || termsCount) && isHomeTab ? (
        <div className="policy-count" aria-live="polite">
          {privacyCount && (
            <div className="count-item">
              <span className="count-icon" role="img" aria-label="Privacy policies reviewed">
                🔐
              </span>
              <div className="count-details">
                <span className="count-value">{privacyCount}</span>
              </div>
            </div>
          )}
          <div className="count-divider" aria-hidden="true" />
          {termsCount && (
            <div className="count-item">
              <span className="count-icon" role="img" aria-label="Terms of service reviewed">
                📜
              </span>
              <div className="count-details">
                <span className="count-value">{termsCount}</span>
              </div>
            </div>
          )}
        </div>
      ) : null}
      {!isSignedIn && !isLoading ? (
        <button className="menu-button" title="Menu" onClick={() => onSignUp('chat')}>
          Sign Up
        </button>
      ) : null}
    </div>
  );
};
