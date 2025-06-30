import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 移动端兼容性检查和修复
function initMobileCompatibility() {
  // 检测移动端
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  
  if (isMobile || isSmallScreen) {
    console.log('检测到移动端设备，应用移动端优化');
    
    // 设置视口
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
    
    // 防止移动端缩放
    document.addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // 设置移动端样式
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // 添加移动端标识
    document.body.classList.add('mobile-device');
  }
}

// 错误处理
function setupErrorHandling() {
  window.addEventListener('error', (e) => {
    console.error('应用错误:', e.error);
    // 在移动端显示错误信息
    if (window.innerWidth <= 768) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        max-width: 90%;
        text-align: center;
      `;
      errorDiv.innerHTML = `
        <h3>应用加载错误</h3>
        <p>${e.message}</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; background: white; color: black; border: none; border-radius: 5px;">重新加载</button>
      `;
      document.body.appendChild(errorDiv);
    }
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise错误:', e.reason);
  });
}

// 路由调试
function setupRouteDebugging() {
  console.log('应用启动 - 当前路径:', window.location.pathname);
  console.log('应用启动 - 完整URL:', window.location.href);
  
  // 监听路由变化
  window.addEventListener('popstate', () => {
    console.log('路由变化:', window.location.pathname);
  });
}

// 初始化
initMobileCompatibility();
setupErrorHandling();
setupRouteDebugging();

// 确保DOM加载完成后再渲染React应用
function renderApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('找不到root元素');
    return;
  }
  
  // 清除加载占位符
  rootElement.innerHTML = '';
  
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('React应用渲染成功');
    console.log('当前路径:', window.location.pathname);
  } catch (error) {
    console.error('React应用渲染失败:', error);
    // 显示错误信息
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #1a1a1a;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <h2>应用启动失败</h2>
        <p>错误信息: ${error.message}</p>
        <p>当前路径: ${window.location.pathname}</p>
        <button onclick="location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">重新加载</button>
        <button onclick="window.location.href='/'" style="
          margin-top: 10px;
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">返回首页</button>
      </div>
    `;
  }
}

// 等待DOM完全加载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}