'use client';

import { useEffect } from 'react';

export default function AdminKeyListener() {
  useEffect(() => {
    function onKey(e) {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key &&
        e.key.toLowerCase() === 'a'
      ) {
        window.location.href = '/admin';
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
