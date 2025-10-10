import * as React from 'react';
import {User} from '../../api';

interface AccountProps {
  user: User | undefined;
  isLoading: boolean;
  isFetching: boolean;
}

export const Accounts = ({user}: AccountProps): React.ReactElement => {
  if (!user) {
    return <NoUserAccount />;
  }

  if (!user.email || !user.name) {
    return <SignUpAccount />;
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

      <div className="settings-section">
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

const NoUserAccount = (): React.ReactElement => {
  return <div>No user account found</div>;
};

type AuthMode = 'signup' | 'login';

type AuthUser = {
  name: string;
  email: string;
  password: string;
};

type FieldErrors = {
  name: boolean;
  email: boolean;
  password: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialFieldErrors = (): FieldErrors => ({
  name: false,
  email: false,
  password: false,
});

const validateFields = (currentUser: AuthUser, mode: AuthMode): FieldErrors => {
  const trimmedName = currentUser.name.trim();
  const trimmedEmail = currentUser.email.trim();
  const trimmedPassword = currentUser.password.trim();

  return {
    name: mode === 'signup' ? trimmedName.length === 0 : false,
    email: trimmedEmail.length === 0 || !EMAIL_REGEX.test(trimmedEmail),
    password: trimmedPassword.length === 0,
  };
};

const SignUpAccount = (): React.ReactElement => {
  const [user, setUser] = React.useState<AuthUser>({
    name: '',
    email: '',
    password: '',
  });
  const [mode, setMode] = React.useState<AuthMode>('signup');
  const [submitted, setSubmitted] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>(initialFieldErrors);

  const handleFieldChange = (field: keyof AuthUser) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {value} = event.target;

    setUser((prev) => {
      const updatedUser = {...prev, [field]: value};

      if (submitted) {
        setFieldErrors(validateFields(updatedUser, mode));
      }

      return updatedUser;
    });
  };

  const handleSignUpLogin = (): void => {
    setSubmitted(true);

    const errors = validateFields(user, mode);
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    if (mode === 'signup') {
      console.log('signup', user);
    } else {
      console.log('login', user);
    }
  };

  const handleToggleMode = (): void => {
    setMode((prev) => (prev === 'signup' ? 'login' : 'signup'));
    setSubmitted(false);
    setFieldErrors(initialFieldErrors());
  };

  const isSignup = mode === 'signup';
  const nameHasError = submitted && fieldErrors.name;
  const emailHasError = submitted && fieldErrors.email;
  const passwordHasError = submitted && fieldErrors.password;

  return (
    <div className="settings-content">
      <div className="sign-up-account">
        <h3 className="text-center">{isSignup ? 'Setup a new account' : 'Login to your account'}</h3>
        <div className="sign-up-account-content">
          {isSignup && (
            <div className="sign-up-account-content-item">
              <label className="setting-label" htmlFor="name">
                Name
              </label>
              <input
                required={isSignup}
                type="text"
                className={`setting-input${nameHasError ? ' setting-input--error' : ''}`}
                id="name"
                value={user.name}
                onChange={handleFieldChange('name')}
              />
            </div>
          )}
          <div className="sign-up-account-content-item">
            <label className="setting-label" htmlFor="email">
              Email
            </label>
            <input
              required
              type="email"
              className={`setting-input${emailHasError ? ' setting-input--error' : ''}`}
              id="email"
              value={user.email}
              onChange={handleFieldChange('email')}
            />
          </div>
          <div className="sign-up-account-content-item">
            <label className="setting-label" htmlFor="password">
              Password
            </label>
            <input
              required
              type="password"
              className={`setting-input${passwordHasError ? ' setting-input--error' : ''}`}
              id="password"
              value={user.password}
              onChange={handleFieldChange('password')}
            />
          </div>
          <button className="setting-button secondary" type="button" onClick={handleSignUpLogin}>
            {isSignup ? 'Sign Up' : 'Login'}{' '}
          </button>
          <p className="text-center" onClick={handleToggleMode}>
            already have an account?
          </p>
        </div>
      </div>
    </div>
  );
};
