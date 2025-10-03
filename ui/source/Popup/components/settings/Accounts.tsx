import * as React from 'react';

export const Accounts = (): React.ReactElement => {
  const [user] = React.useState({
    name: 'N/A',
    email: 'N/A',
    avatar: '👤',
  });

  const [connectedAccounts, setConnectedAccounts] = React.useState([
    {
      id: 'google',
      name: 'Google',
      connected: true,
      email: 'john.doe@gmail.com',
    }
  ]);

  const handleAccountToggle = (accountId: string): void => {
    setConnectedAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId
          ? {...account, connected: !account.connected}
          : account
      )
    );
  };

  return (
    <div className="settings-content">
      <div className="settings-section">
        <h3>Profile Information</h3>
        <div className="profile-card">
          <div className="profile-avatar">
            <span className="avatar-icon">{user.avatar}</span>
          </div>
          <div className="profile-info">
            <h4>{user.name}</h4>
            <p>{user.email}</p>
            <button className="setting-button secondary" type="button">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* <div className="settings-section">
        <h3>Account Security</h3>
        <div className="setting-item">
          <div className="security-item">
            <div className="security-info">
              <h4>Password</h4>
              <p>Last changed 3 months ago</p>
            </div>
            <button className="setting-button secondary" type="button">
              Change Password
            </button>
          </div>
        </div>
        <div className="setting-item">
          <div className="security-item">
            <div className="security-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security</p>
            </div>
            <button className="setting-button secondary" type="button">
              Enable 2FA
            </button>
          </div>
        </div>
      </div> */}

      <div className="settings-section">
        <h3>Connected Accounts</h3>
        <div className="connected-accounts">
          {connectedAccounts.map((account) => (
            <div key={account.id} className="account-item">
              <div className="account-info">
                <div className="account-icon">
                  {account.id === 'google' && '🔍'}
                  {account.id === 'github' && '🐙'}
                  {account.id === 'microsoft' && '🪟'}
                </div>
                <div className="account-details">
                  <h4>{account.name}</h4>
                  {account.connected && account.email && <p>{account.email}</p>}
                </div>
              </div>
              <div className="account-actions">
                {account.connected ? (
                  <button
                    type="button"
                    className="setting-button danger"
                    onClick={() => handleAccountToggle(account.id)}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    className="setting-button primary"
                    onClick={() => handleAccountToggle(account.id)}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Data Management</h3>
        <div className="setting-item">
          <div className="data-item">
            <div className="data-info">
              <h4>Download Your Data</h4>
              <p>Get a copy of all your data</p>
            </div>
            <button className="setting-button secondary" type="button">
              Download
            </button>
          </div>
        </div>
        <div className="setting-item">
          <div className="data-item">
            <div className="data-info">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all data</p>
            </div>
            <button className="setting-button danger" type="button">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
