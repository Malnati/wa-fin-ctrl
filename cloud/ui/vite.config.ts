// ui/vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // No hard-coded fallbacks - all defaults should be in docker-compose.yml
  const API_PROXY_TARGET = env.VITE_API_URL;
  const DEV_SERVER_PORT = parseInt(env.VITE_DEV_SERVER_PORT, 10);
  const PREVIEW_ALLOWED_HOSTS = (env.VITE_PREVIEW_ALLOWED_HOSTS ?? '').split(',').filter(Boolean);

  if (!API_PROXY_TARGET) {
    throw new Error('VITE_API_URL environment variable is required');
  }
  
  if (!env.VITE_DEV_SERVER_PORT || isNaN(DEV_SERVER_PORT)) {
    throw new Error('VITE_DEV_SERVER_PORT environment variable is required and must be a valid number');
  }

  return {
    plugins: [react()],
    server: {
      port: DEV_SERVER_PORT,
      strictPort: true,
      hmr: {
        overlay: false
      },
      proxy: {
        '/diagnostics': {
          target: API_PROXY_TARGET,
          changeOrigin: true,
        }
      }
    },
    preview: {
      allowedHosts: PREVIEW_ALLOWED_HOSTS.length > 0 ? PREVIEW_ALLOWED_HOSTS : undefined,
      port: DEV_SERVER_PORT,
    },
  };
})
