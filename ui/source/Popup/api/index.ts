import {CHAT_HISTORY_LIMIT, CLARITY_API_URL, CLARITY_BROWSER_ID_KEY, CLARITY_TOKEN_KEY} from '../../common/constants';
import {ChatInLocalStorage} from '../components/chat/types';
import {getSetting} from '../../common/utils';

export type Plan = 'pro' | 'team' | 'free';
export interface User {
  id: string;
  browserId: string;
  name: string | null;
  email: string | null;
  numberOfSummaries: number;
  createdAt: string;
  plan: Plan;
}

export interface PolicyCount {
  privacy: number;
  terms: number;
}

const getToken = async (): Promise<string> => {
  const token = await getSetting(CLARITY_TOKEN_KEY, '');
  return `Bearer ${token}`;
};

export const getUserByBrowserId = async (): Promise<{user: User; message: string; status: string}> => {
  try {
    const token = await getToken();
    const browserId = await getSetting(CLARITY_BROWSER_ID_KEY, '');
    const response = await fetch(`${CLARITY_API_URL}/user/browser/${browserId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const getPolicyCount = async (): Promise<PolicyCount> => {
  const token = await getToken();
  const response = await fetch(`${CLARITY_API_URL}/scout/count`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

export const landingPageQuery = async () => {
  return Promise.all([getPolicyCount(), getUserByBrowserId()]);
};

export const getChatHistory = async ({
  userId,
  page,
  limit = CHAT_HISTORY_LIMIT,
}: {
  userId: string;
  page?: number;
  limit?: number;
}): Promise<ChatInLocalStorage> => {
  const token = await getToken();
  const response = await fetch(`${CLARITY_API_URL}/chat/history/${userId}?page=${page}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};
export const signup = async ({
  name,
  email,
  password,
  browserId,
}: {
  name: string;
  email: string;
  password: string;
  browserId: string;
}): Promise<{user: User; token: string}> => {
  try {
    const token = await getToken();
    const response = await fetch(`${CLARITY_API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({name, email, password, browserId}),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    if (!response.ok) {
      throw response;
    }
    return await response.json();
  } catch (error) {
    throw await (error as Response).json();
  }
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{user: User; token: string}> => {
  try {
    const token = await getToken();
    const response = await fetch(`${CLARITY_API_URL}/auth/signin`, {
      method: 'POST',
      body: JSON.stringify({email, password}),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    if (!response.ok) {
      throw response;
    }
    return response.json();
  } catch (error) {
    throw await (error as Response).json();
  }
};
