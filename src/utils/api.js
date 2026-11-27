const TOKEN_STORAGE_KEY = 'tcg_auth_token';

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage failures
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('tcg_admin_logged_in');
  } catch {
    // ignore
  }
}

let unauthorizedHandler = null;

export function registerUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export async function authFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (res.status === 401 && unauthorizedHandler && !url.includes('/login')) {
    // Only trigger global unauthorized logout for server-signed sessions,
    // NEVER disrupt resilient client-side/offline fallback sessions (e.g. Vercel static hosting)
    const isOfflineToken = token.startsWith('tcg_dev_token_') ||
      token.startsWith('tcg_admin_token_') ||
      token.startsWith('tcg_student_token_');
    if (!isOfflineToken) {
      unauthorizedHandler();
    }
  }

  return res;
}
