import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 API Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🌐 API Proxy request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ API Proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Socket.IO 代理
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true, // 启用 WebSocket 代理
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Socket Proxy error:', err);
          });
        },
      },
      // 健康检查代理
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
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
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  }
});