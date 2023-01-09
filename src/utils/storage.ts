import GitApiWrapper from './GitApiWrapper';

interface SessionStorage {
  access_token: string;
  git_provider: keyof typeof GitApiWrapper;
  expire_in: string;
  refresh_token: string;
}

interface LocalStorage {
  isCookiesAccepted: string;
}

export const setSessionStorage = <Key extends keyof SessionStorage>(
  key: Key,
  value: SessionStorage[Key]
) => {
  sessionStorage.setItem(key, value);
};

export const getSessionStorage = <Key extends keyof SessionStorage>(
  key: Key
): SessionStorage[Key] | null => {
  return sessionStorage.getItem(key) as SessionStorage[Key] | null;
};

export const removeSessionStorage = <Key extends keyof SessionStorage>(
  key: Key
): void => {
  sessionStorage.removeItem(key);
};

export const setLocalStorage = <Key extends keyof LocalStorage>(
  key: Key,
  value: LocalStorage[Key]
) => {
  localStorage.setItem(key, value);
};

export const getLocalStorage = <Key extends keyof LocalStorage>(
  key: Key
): LocalStorage[Key] | null => {
  return localStorage.getItem(key);
};

export const removeLocalStorage = <Key extends keyof LocalStorage>(
  key: Key
): void => {
  localStorage.removeItem(key);
};
