// Theme helpers — default is light. Dark is a toggle.
// Landing page forces dark regardless of saved theme via a useEffect that
// sets data-theme=dark for the duration of the page.

const KEY = 'chatty_theme';

export function getTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.localStorage.getItem(KEY) || 'light';
  } catch (e) {
    return 'light';
  }
}

export function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', next);
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, next);
    } catch (e) {
      // ignore
    }
  }
  return next;
}

export function toggleTheme() {
  const current = getTheme();
  return setTheme(current === 'dark' ? 'light' : 'dark');
}

// For landing page: force dark for this page only without touching storage.
export function forceDarkForPage() {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

export function restoreSavedTheme() {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', getTheme());
  }
}
