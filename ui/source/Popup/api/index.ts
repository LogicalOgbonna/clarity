import {CLARITY_API_URL} from '../../common/constants';
import {getBrowserId} from '../utils';

export interface User {
  id: string;
  browserId: string;
  name: string | null;
  email: string | null;
  numberOfSummaries: number;
  createdAt: string;
}

export const getUserByBrowserId = async (): Promise<{user: User; message: string; status: string}> => {
  try {
    const browserId = await getBrowserId();
    const response = await fetch(`${CLARITY_API_URL}/user/browser/${browserId}`);
    return response.json();
  } catch (error) {
    console.error('Error getting user by browser ID:', error);
    throw error;
  }
};

export const createUser = async ({
  name,
  email,
  password,
  id,
}: {
  name: string;
  email: string;
  password: string;
  id: string;
}): Promise<{user: User; message: string; status: string}> => {
  const response = await fetch(`${CLARITY_API_URL}/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify({name, email, password}),
  });
  return response.json();
};

export const loginUser = async (user: User): Promise<{user: User; message: string; status: string}> => {
  const response = await fetch(`${CLARITY_API_URL}/user/login`, {
    method: 'POST',
    body: JSON.stringify(user),
  });
  return response.json();
};
