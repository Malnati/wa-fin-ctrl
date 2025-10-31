// cloud/ui/vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const API_PROXY_PATHS = ["/api", "/reports", "/static", "/imgs"] as const;
const REQUIRED_API_URL_ERROR = "VITE_API_URL environment variable is required";
const REQUIRED_PORT_ERROR =
  "VITE_DEV_SERVER_PORT environment variable is required and must be a valid number";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiProxyTarget = env.VITE_API_URL;
  const devServerPort = Number.parseInt(env.VITE_DEV_SERVER_PORT, 10);
  const previewAllowedHosts = (env.VITE_PREVIEW_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  if (!apiProxyTarget) {
    throw new Error(REQUIRED_API_URL_ERROR);
  }

  if (!env.VITE_DEV_SERVER_PORT || Number.isNaN(devServerPort)) {
    throw new Error(REQUIRED_PORT_ERROR);
  }

  const proxy = API_PROXY_PATHS.reduce<Record<string, { target: string; changeOrigin: boolean }>>(
    (accumulator, path) => ({
      ...accumulator,
      [path]: {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    }),
    {},
  );

  return {
    plugins: [react()],
    server: {
      port: devServerPort,
      strictPort: true,
      hmr: {
        overlay: false,
      },
      proxy,
    },
    preview: {
      port: devServerPort,
      allowedHosts:
        previewAllowedHosts.length > 0 ? previewAllowedHosts : undefined,
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/setupTests.ts",
    },
  };
});
