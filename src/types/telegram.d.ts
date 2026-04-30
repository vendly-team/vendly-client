interface Window {
  Telegram?: {
    WebApp?: {
      initData: string;
      initDataUnsafe: {
        user?: {
          id: number;
          first_name: string;
          last_name?: string;
          username?: string;
          language_code?: string;
        };
      };
      platform: string;
      colorScheme: 'light' | 'dark';
      viewportHeight: number;
      viewportStableHeight: number;
      isExpanded: boolean;
      ready(): void;
      expand(): void;
      close(): void;
    };
  };
}
