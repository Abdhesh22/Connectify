import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'CONFIG_')

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    envPrefix: 'APP_',
    server: {
      port: env.CONFIG_SERVER_PORT,
      open: env.CONFIG_SERVER_OPEN,
      proxy: {
        '/api': {
          target: env.CONFIG_SERVER_PROXY
        }
      },
      strictPort: true,
    }
  }
})