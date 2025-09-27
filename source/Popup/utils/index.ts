/* eslint-disable @typescript-eslint/no-explicit-any */
import {browser} from 'webextension-polyfill-ts';

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  }
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  }
  if (diffInHours < 168) {
    // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`;
  }
  return date.toLocaleDateString();
};

// Settings storage utilities
export const saveSetting = async <T>(key: string, value: T): Promise<void> => {
  try {
    await browser.storage.sync.set({[key]: value});
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error);
    throw error;
  }
};

export const getSetting = async <T>(
  key: string,
  defaultValue: T
): Promise<T> => {
  try {
    const result = await browser.storage.sync.get(key);
    return result[key] !== undefined ? result[key] : defaultValue;
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error);
    return defaultValue;
  }
};

export const saveMultipleSettings = async (
  settings: Record<string, any>
): Promise<void> => {
  try {
    await browser.storage.sync.set(settings);
  } catch (error) {
    console.error('Failed to save multiple settings:', error);
    throw error;
  }
};

export const getAllSettings = async (): Promise<Record<string, any>> => {
  try {
    return await browser.storage.sync.get();
  } catch (error) {
    console.error('Failed to get all settings:', error);
    return {};
  }
};

export const removeSetting = async (key: string): Promise<void> => {
  try {
    await browser.storage.sync.remove(key);
  } catch (error) {
    console.error(`Failed to remove setting ${key}:`, error);
    throw error;
  }
};

// Specific settings keys
export const SETTINGS_KEYS = {
  LLM_PROVIDER: 'llmProvider',
  CHROME_CONFIG: 'chromeConfig',
  LANGUAGE: 'language',
  THEME: 'theme',
  NOTIFICATIONS: 'notifications',
  AUTO_ANALYZE: 'autoAnalyze',
} as const;
