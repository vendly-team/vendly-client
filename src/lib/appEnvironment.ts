const SESSION_KEY = 'app-source';

if (typeof window !== 'undefined') {
  try {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    if (from === 'telegram' || from === 'tg') {
      sessionStorage.setItem(SESSION_KEY, 'tg');
    }
  } catch {}
}

export type AppEnvironment = {
  isTelegram: boolean;
  isBrowser: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isIos: boolean;
  isAndroid: boolean;
  telegramPlatform: string | null;
  telegramColorScheme: 'light' | 'dark' | null;
  viewportHeight: number;
  viewportStableHeight: number;
};

function detectMobile(): boolean {
  return window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
}

function detectIos(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function detectAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

function compute(): AppEnvironment {
  const tg = window.Telegram?.WebApp;
  const isTelegram = Boolean(tg) || sessionStorage.getItem(SESSION_KEY) === 'tg';
  const isMobile = detectMobile();
  const isIos = detectIos();
  const isAndroid = detectAndroid();

  return {
    isTelegram,
    isBrowser: !isTelegram,
    isMobile,
    isDesktop: !isMobile,
    isIos,
    isAndroid,
    telegramPlatform: tg?.platform ?? null,
    telegramColorScheme: tg?.colorScheme ?? null,
    viewportHeight: tg?.viewportHeight ?? window.innerHeight,
    viewportStableHeight: tg?.viewportStableHeight ?? window.innerHeight,
  };
}

function applyToDOM(env: AppEnvironment): void {
  const root = document.documentElement;

  root.setAttribute('data-host', env.isTelegram ? 'telegram' : 'browser');
  root.setAttribute('data-device', env.isMobile ? 'mobile' : 'desktop');

  if (env.telegramPlatform) {
    root.setAttribute('data-telegram-platform', env.telegramPlatform);
  }
  if (env.telegramColorScheme) {
    root.setAttribute('data-theme', env.telegramColorScheme);
  }

  root.style.setProperty('--app-viewport-height', `${env.viewportHeight}px`);
  root.style.setProperty('--app-stable-viewport-height', `${env.viewportStableHeight}px`);
  root.style.setProperty(
    '--app-safe-area-bottom',
    env.isMobile ? 'env(safe-area-inset-bottom, 0px)' : '0px',
  );
  root.style.setProperty(
    '--app-bottom-nav-offset',
    env.isMobile
      ? 'calc(66px + 12px + var(--app-safe-area-bottom) + 20px)'
      : '0px',
  );
}

// --- Observable store ---

type Listener = () => void;
const listeners = new Set<Listener>();

let currentEnv: AppEnvironment = {
  isTelegram: false,
  isBrowser: true,
  isMobile: false,
  isDesktop: true,
  isIos: false,
  isAndroid: false,
  telegramPlatform: null,
  telegramColorScheme: null,
  viewportHeight: 0,
  viewportStableHeight: 0,
};

function update(): void {
  currentEnv = compute();
  applyToDOM(currentEnv);
  listeners.forEach(fn => fn());
}

export function getEnvironment(): AppEnvironment {
  return currentEnv;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initAppEnvironment(): void {
  update();

  window.addEventListener('resize', update, { passive: true });

  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    if (typeof tg.requestFullscreen === 'function') {
      tg.requestFullscreen();
    }
    tg.onEvent('viewportChanged', update);
    tg.onEvent('themeChanged', update);
  }
}
