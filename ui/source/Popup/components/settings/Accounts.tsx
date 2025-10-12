import * as React from 'react';
import {User} from '../../api';
import {SignUpSignin} from '../shared/auth';

interface AccountProps {
  user: User | undefined;
  isLoading: boolean;
  isFetching: boolean;
}

export const Accounts = ({user}: AccountProps): React.ReactElement => {

  if (!user || !user.email || !user.name) {
    return <SignUpSignin defaultMode="signup" />;
  }

  return (
    <div className="settings-content">
      <div className="settings-section">
        <h3>Profile Information</h3>
        <div className="profile-card">
          <div className="profile-avatar">
            <span className="avatar-icon">{user.name.charAt(0)}</span>
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
        {/* <div className="setting-item">
          <div className="data-item">
            <div className="data-info">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all data</p>
            </div>
            <button className="setting-button danger" type="button">
              Delete Account
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};
