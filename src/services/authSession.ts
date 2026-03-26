const AUTH_SESSION_HINT_KEY = 'customer_portal_has_session';

export const setAuthSessionHint = (hasSession: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (hasSession) {
    localStorage.setItem(AUTH_SESSION_HINT_KEY, '1');
    return;
  }

  localStorage.removeItem(AUTH_SESSION_HINT_KEY);
};

export const hasAuthSessionHint = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(AUTH_SESSION_HINT_KEY) === '1';
};
