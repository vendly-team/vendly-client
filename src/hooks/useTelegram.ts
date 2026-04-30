const SESSION_KEY = 'app-source';

function initSource() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('from') === 'telegram') {
    sessionStorage.setItem(SESSION_KEY, 'tg');
  }
}

initSource();

export function useTelegram() {
  const isMiniApp =
    typeof window !== 'undefined' &&
    (Boolean(window.Telegram?.WebApp) ||
      sessionStorage.getItem(SESSION_KEY) === 'tg');

  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

  return {
    isMiniApp,
    tg,
    platform: tg?.platform,
    colorScheme: tg?.colorScheme,
    user: tg?.initDataUnsafe?.user,
  };
}
