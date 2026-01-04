import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "CONFIG_");

  return {
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    envPrefix: "APP_",
    server: {
      port: Number(env.CONFIG_SERVER_PORT) || 5173,
      open: env.CONFIG_SERVER_OPEN === "true",
      strictPort: true,
      proxy: {
        "/api": {
          target: env.CONFIG_SERVER_PROXY,
          changeOrigin: true,
        },
      },
    },
  };
});
