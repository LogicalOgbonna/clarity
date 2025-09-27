import * as React from 'react';
import {Languages} from '../shared/language';
import {saveSetting, getSetting, SETTINGS_KEYS} from '../../utils';

export const General = (): React.ReactElement => {
  const [language, setLanguage] = React.useState('en');
  // const [theme, setTheme] = React.useState('light');
  // const [notifications, setNotifications] = React.useState(true);
  const [autoAnalyze, setAutoAnalyze] = React.useState(false);
  const [llmProvider, setLlmProvider] = React.useState<'chrome' | 'server'>(
    'chrome'
  );
  const [chromeConfig, setChromeConfig] = React.useState({
    defaultTemperature: 1,
    defaultTopK: 3,
    maxTemperature: 2,
    maxTopK: 128,
  });

  const updateChromeConfig = (
    key: keyof typeof chromeConfig,
    value: number
  ): void => {
    setChromeConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Load settings on component mount
  React.useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        const [
          savedLanguage,
          //   savedTheme,
          //   savedNotifications,
          savedAutoAnalyze,
          savedLlmProvider,
          savedChromeConfig,
        ] = await Promise.all([
          getSetting(SETTINGS_KEYS.LANGUAGE, 'en'),
          //   getSetting(SETTINGS_KEYS.THEME, 'light'),
          //   getSetting(SETTINGS_KEYS.NOTIFICATIONS, true),
          getSetting(SETTINGS_KEYS.AUTO_ANALYZE, false),
          getSetting(SETTINGS_KEYS.LLM_PROVIDER, 'chrome'),
          getSetting(SETTINGS_KEYS.CHROME_CONFIG, {
            defaultTemperature: 1,
            defaultTopK: 3,
            maxTemperature: 2,
            maxTopK: 128,
          }),
        ]);

        setLanguage(savedLanguage);
        // setTheme(savedTheme);
        // setNotifications(savedNotifications);
        setAutoAnalyze(savedAutoAnalyze);
        setLlmProvider(savedLlmProvider as 'chrome' | 'server');
        setChromeConfig(savedChromeConfig);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings when they change
  React.useEffect(() => {
    const saveSettings = async (): Promise<void> => {
      try {
        await Promise.all([
          saveSetting(SETTINGS_KEYS.LANGUAGE, language),
          //   saveSetting(SETTINGS_KEYS.THEME, theme),
          //   saveSetting(SETTINGS_KEYS.NOTIFICATIONS, notifications),
          saveSetting(SETTINGS_KEYS.AUTO_ANALYZE, autoAnalyze),
          saveSetting(SETTINGS_KEYS.LLM_PROVIDER, llmProvider),
          saveSetting(SETTINGS_KEYS.CHROME_CONFIG, chromeConfig),
        ]);
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [language, autoAnalyze, llmProvider, chromeConfig]);

  return (
    <div className="settings-content">
      <div className="settings-section">
        <h3>AI Provider</h3>
        <div className="setting-item">
          <label htmlFor="llmProvider">Choose AI Provider</label>
          <select
            id="llmProvider"
            value={llmProvider}
            onChange={(e) =>
              setLlmProvider(e.target.value as 'chrome' | 'server')
            }
            className="setting-input"
          >
            <option value="chrome">Chrome Built-in LLM</option>
            <option value="server">Server-based LLM</option>
          </select>
        </div>

        {llmProvider === 'chrome' && (
          <div className="chrome-settings">
            <h4>Chrome LLM Configuration</h4>

            <div className="setting-item">
              <label htmlFor="defaultTemperature">
                Default Temperature: {chromeConfig.defaultTemperature}
              </label>
              <input
                id="defaultTemperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={chromeConfig.defaultTemperature}
                onChange={(e) =>
                  updateChromeConfig(
                    'defaultTemperature',
                    parseFloat(e.target.value)
                  )
                }
                className="setting-range"
              />
              <div className="range-labels">
                <span>0 (Deterministic)</span>
                <span>2 (Creative)</span>
              </div>
            </div>

            <div className="setting-item">
              <label htmlFor="defaultTopK">
                Default Top-K: {chromeConfig.defaultTopK}
              </label>
              <input
                id="defaultTopK"
                type="range"
                min="1"
                max="128"
                step="1"
                value={chromeConfig.defaultTopK}
                onChange={(e) =>
                  updateChromeConfig('defaultTopK', parseInt(e.target.value))
                }
                className="setting-range"
              />
              <div className="range-labels">
                <span>1 (Focused)</span>
                <span>128 (Diverse)</span>
              </div>
            </div>

            <div className="setting-item">
              <label htmlFor="maxTemperature">
                Max Temperature: {chromeConfig.maxTemperature}
              </label>
              <input
                id="maxTemperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={chromeConfig.maxTemperature}
                onChange={(e) =>
                  updateChromeConfig(
                    'maxTemperature',
                    parseFloat(e.target.value)
                  )
                }
                className="setting-range"
              />
              <div className="range-labels">
                <span>0 (Deterministic)</span>
                <span>2 (Creative)</span>
              </div>
            </div>

            <div className="setting-item">
              <label htmlFor="maxTopK">Max Top-K: {chromeConfig.maxTopK}</label>
              <input
                id="maxTopK"
                type="range"
                min="1"
                max="128"
                step="1"
                value={chromeConfig.maxTopK}
                onChange={(e) =>
                  updateChromeConfig('maxTopK', parseInt(e.target.value))
                }
                className="setting-range"
              />
              <div className="range-labels">
                <span>1 (Focused)</span>
                <span>128 (Diverse)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>Language & Region</h3>
        <div className="setting-item">
          <label htmlFor="language">Default Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="setting-input"
          >
            {Languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TODO: Add theme settings */}
      {/* <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-item">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="setting-input"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div> */}

      <div className="settings-section">
        <h3>Behavior</h3>
        {/* TODO: Add notifications settings */}
        {/* <div className="setting-item">
          <div className="setting-toggle">
            <input
              type="checkbox"
              id="notifications"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <label htmlFor="notifications">Enable notifications</label>
          </div>
        </div> */}
        <div className="setting-item">
          <div className="setting-toggle">
            <input
              type="checkbox"
              id="autoAnalyze"
              checked={autoAnalyze}
              onChange={(e) => setAutoAnalyze(e.target.checked)}
            />
            <label htmlFor="autoAnalyze">Auto-analyze on page load</label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Data & Privacy</h3>
        <div className="setting-item">
          <button className="setting-button secondary" type="button">
            Clear chat history
          </button>
        </div>
        {/* TODO: Add export data settings */}
        {/* <div className="setting-item">
          <button className="setting-button secondary" type="button">
            Export data
          </button>
        </div> */}
      </div>
    </div>
  );
};
