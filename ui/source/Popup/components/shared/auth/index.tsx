import React from 'react';
import {useMutation, useQueryClient} from 'react-query';
import {login, signup, User} from '../../../api';
import {getSetting, saveSetting} from '../../../../common/utils';
import {CLARITY_BROWSER_ID_KEY, CLARITY_TOKEN_KEY, CLARITY_USER_ID_KEY} from '../../../../common/constants';
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

export const SignUpSignin = ({
  onSuccess,
  defaultMode = 'signup',
}: {
  onSuccess?: (user: User) => void;
  defaultMode?: AuthMode;
}): React.ReactElement => {
  const [user, setUser] = React.useState<AuthUser>({
    name: '',
    email: '',
    password: '',
  });
  const [mode, setMode] = React.useState<AuthMode>(defaultMode);
  const [submitted, setSubmitted] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>(initialFieldErrors);
  const queryClient = useQueryClient();

  const {mutate, isLoading} = useMutation({
    mutationFn: (user: {email: string; password: string; name: string; browserId: string}) => {
      if (mode === 'signup') {
        return signup(user);
      }
      return login({email: user.email, password: user.password});
    },
    onSuccess: (data) => {
      saveSetting(CLARITY_TOKEN_KEY, data.token);
      saveSetting(CLARITY_USER_ID_KEY, data.user.id);
      onSuccess?.(data.user);
      //   invalidate queries
      queryClient.invalidateQueries(['landing-page-data']);
    },
    onError: (error: {cause?: string; message: string; code: string}) => {
      if (error.code === 'bad_request:auth') {
        setFieldErrors({
          name: true,
          email: true,
          password: true,
        });
      }
    },
  });

  const handleFieldChange =
    (field: keyof AuthUser) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const {value} = event.target;

      setUser((prev) => {
        const updatedUser = {...prev, [field]: value};

        if (submitted) {
          setFieldErrors(validateFields(updatedUser, mode));
        }

        return updatedUser;
      });
    };

  const handleSignUpLogin = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const browserId = await getSetting(CLARITY_BROWSER_ID_KEY, '');
    setSubmitted(true);

    const errors = validateFields(user, mode);
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    if (mode === 'signup') {
      mutate({email: user.email, password: user.password, name: user.name, browserId});
    } else {
      mutate({
        email: user.email,
        password: user.password,
        browserId,
        name: '',
      });
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

  const modeTextMapper: Record<
    AuthMode,
    {
      buttonText: string;
      title: string;
      subtitle: string;
      loadingText: string;
    }
  > = {
    signup: {
      buttonText: 'Sign Up',
      title: 'Setup a new account',
      subtitle: 'Already have an account?',
      loadingText: 'Signing up...',
    },
    login: {
      buttonText: 'Login',
      title: 'Login to your account',
      subtitle: "Don't have an account?",
      loadingText: 'Logging in...',
    },
  };

  return (
    <div className="sign-up-account-content">
      <div className="sign-up-account">
        <h3 className="text-center">{modeTextMapper[mode].title}</h3>
        {/* <div className="sign-up-account-items"> */}
        <form onSubmit={handleSignUpLogin} className="sign-up-account-items">
          {isSignup && (
            <div className="sign-up-account-item">
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
          <div className="sign-up-account-item">
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
          <div className="sign-up-account-item">
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
          <button disabled={isLoading} className="setting-button secondary" type="submit">
            {isLoading ? modeTextMapper[mode].loadingText : modeTextMapper[mode].buttonText}
          </button>
          <p className="text-center" onClick={handleToggleMode}>
            {modeTextMapper[mode].subtitle}
          </p>
        </form>
        {/* </div> */}
      </div>
    </div>
  );
};
