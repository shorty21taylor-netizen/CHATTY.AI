export const ADMIN_EMAILS = ['shorty21taylor@gmail.com'];
export const ADMIN_BYPASS_PASSWORD =
  process.env.ADMIN_BYPASS_PASSWORD || 'Chatty2026!';

export function isAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function getAdminSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('chatty_admin_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(email) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    'chatty_admin_session',
    JSON.stringify({
      email,
      isAdmin: true,
      loggedInAt: Date.now(),
    })
  );
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chatty_admin_session');
  }
}
