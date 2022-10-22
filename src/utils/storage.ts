interface SessionStorage {
  github_access_token: string;
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
  return sessionStorage.getItem(key);
};

export const removeSessionStorage = <Key extends keyof SessionStorage>(
  key: Key
): void => {
  sessionStorage.removeItem(key);
};
