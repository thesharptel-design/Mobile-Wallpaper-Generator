
const STORAGE_KEY = 'moodpaper_api_key_secure_v1';
const SALT = 'MOODPAPER_CLIENT_SALT_'; // Basic salt for obfuscation

export const saveApiKey = (apiKey: string): void => {
  if (!apiKey) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  try {
    // Basic obfuscation to prevent plain text storage in LocalStorage
    // in a real prod env, we might use Web Crypto API, but this prevents casual reading
    const encrypted = btoa(SALT + apiKey);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (e) {
    console.error("Failed to save API key", e);
  }
};

export const getApiKey = (): string | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const decrypted = atob(stored);
    if (decrypted.startsWith(SALT)) {
      return decrypted.replace(SALT, '');
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const hasApiKey = (): boolean => {
  return !!getApiKey();
};
