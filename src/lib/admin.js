export const ADMIN_EMAILS = ['shorty21taylor@gmail.com'];
export const ADMIN_BYPASS_PASSWORD =
  process.env.ADMIN_BYPASS_PASSWORD || 'Chatty2026!';
// Dev-only shortcut: skip Stripe checkout and drop the user straight on the
// dashboard as an admin session. MUST be false in production. Opt in locally
// by setting NEXT_PUBLIC_DEV_BYPASS_ENABLED=1 in .env.local.
export const DEV_BYPASS_ENABLED =
  process.env.NEXT_PUBLIC_DEV_BYPASS_ENABLED === '1';

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

export function devBypass() {
  setAdminSession('shorty21taylor@gmail.com');
}
