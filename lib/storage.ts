// localStorage can throw (private mode, quota, blocked cookies): every access is wrapped in try/catch.
export const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* no persistence */
    }
  },
};

export const GITHUB_URL = "https://github.com/ricardoerl/nosoytufan.com";
export const SITE_URL = "https://nosoytufan.com";
