import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const proxyTarget = env.VITE_PROXY_TARGET;

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: ['signe-clayish-elaina.ngrok-free.dev'],
      hmr: {
        overlay: false,
      },
      ...(proxyTarget && {
        proxy: {
          '/backend': {
            target: proxyTarget,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/backend/, ''),
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          },
        },
      }),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
