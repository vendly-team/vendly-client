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
  const isTelegram = isInsideTelegramHost(tg) || sessionStorage.getItem(SESSION_KEY) === 'tg';
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

// `window.Telegram.WebApp` exists in any browser that loads telegram-web-app.js,
// not just inside Telegram. The script defaults to `platform: 'unknown'` and
// `version: '6.0'` in non-Telegram hosts, and methods like `requestFullscreen`
// throw `WebAppMethodUnsupported`. Only call Telegram APIs when we are really
// running inside the Telegram client.
function isInsideTelegramHost(tg: TelegramWebApp | undefined): boolean {
  if (!tg) return false;
  const hasInitData = typeof tg.initData === 'string' && tg.initData.length > 0;
  const hasKnownPlatform =
    typeof tg.platform === 'string' && tg.platform !== '' && tg.platform !== 'unknown';
  return hasInitData || hasKnownPlatform;
}

function botApiVersionAtLeast(tg: TelegramWebApp, target: number): boolean {
  const parsed = parseFloat(tg.version ?? '0');
  return Number.isFinite(parsed) && parsed >= target;
}

export function initAppEnvironment(): void {
  update();

  window.addEventListener('resize', update, { passive: true });

  const tg = window.Telegram?.WebApp;
  if (!tg || !isInsideTelegramHost(tg)) return;

  tg.ready();
  tg.expand();

  // requestFullscreen was introduced in Bot API 8.0 (Dec 2024). Older clients
  // throw `WebAppMethodUnsupported` even though the method exists on the JS shim.
  if (botApiVersionAtLeast(tg, 8.0) && typeof tg.requestFullscreen === 'function') {
    try {
      tg.requestFullscreen();
    } catch {
      // Some clients advertise version >= 8.0 but still reject the method —
      // swallow silently, the visual fallback is the regular expanded viewport.
    }
  }

  tg.onEvent('viewportChanged', update);
  tg.onEvent('themeChanged', update);
}
