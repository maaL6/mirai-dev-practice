import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDocker = fs.existsSync('/.dockerenv');
  const defaultTarget = isDocker ? 'http://backend:8000/api' : 'http://localhost:8010/api';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: isDocker ? 'http://backend:8000/api' : (env.VITE_API_URL?.startsWith('http') ? env.VITE_API_URL : 'http://localhost:8010/api'),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
    },
  };
});
