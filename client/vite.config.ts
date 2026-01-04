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
      host: true,
      port: Number(env.CONFIG_SERVER_PORT) || 5173,
      open: env.CONFIG_SERVER_OPEN === "true",
      strictPort: true,
      allowedHosts: ["connectify-mc8y.onrender.com"],
      proxy: {
        "/api": {
          target: env.CONFIG_SERVER_PROXY,
          changeOrigin: true,
        },
      },
    },
  };
});
