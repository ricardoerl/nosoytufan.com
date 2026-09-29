// localStorage puede lanzar (modo privado, cuota, cookies bloqueadas): todo va en try/catch.
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
      /* sin persistencia */
    }
  },
};

export const GITHUB_URL = "https://github.com/nosoytufan/nosoytufan.com";
export const SITE_URL = "https://nosoytufan.com";
