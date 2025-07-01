import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    host: true,
    open: false, // 不自动打开浏览器
    cors: true,
    proxy: {
      // API 代理
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // 健康检查代理
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // Socket.IO 代理
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true, // 启用 WebSocket 代理
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          socket: ['socket.io-client']
        }
      }
    }
  },
  define: {
    // 确保环境变量在构建时可用
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});