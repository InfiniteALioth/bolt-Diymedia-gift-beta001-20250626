import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('=== React应用开始初始化 ===');

// 移动端兼容性增强
function enhanceMobileCompatibility() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  
  if (isMobile || isSmallScreen) {
    console.log('应用移动端增强优化');
    
    // 设置视口
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    
    // 添加移动端标识类
    document.body.classList.add('mobile-device');
    document.documentElement.classList.add('mobile-device');
    
    // 强制设置样式
    const style = document.createElement('style');
    style.textContent = `
      .mobile-device {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
        touch-action: manipulation !important;
      }
      
      .mobile-device * {
        -webkit-tap-highlight-color: transparent !important;
      }
      
      .mobile-device #root {
        width: 100vw !important;
        height: 100vh !important;
        height: -webkit-fill-available !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('移动端增强优化完成');
  }
}

// 错误处理增强
function setupEnhancedErrorHandling() {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    originalConsoleError.apply(console, args);
    
    // 在移动端显示关键错误
    if (window.innerWidth <= 768 && args.length > 0) {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('React') || errorMessage.includes('render') || errorMessage.includes('component')) {
        showMobileError('React组件错误', errorMessage);
      }
    }
  };
  
  window.addEventListener('error', (e) => {
    console.error('全局错误捕获:', e.error);
    if (window.innerWidth <= 768) {
      showMobileError('应用运行错误', e.message || '未知错误');
    }
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise错误捕获:', e.reason);
    if (window.innerWidth <= 768) {
      showMobileError('异步操作错误', e.reason?.toString() || '未知Promise错误');
    }
  });
}

function showMobileError(title, message) {
  // 避免重复显示错误
  if (document.querySelector('.mobile-error-display')) return;
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'mobile-error-display';
  errorDiv.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    background: rgba(239, 68, 68, 0.95) !important;
    color: white !important;
    padding: 20px !important;
    border-radius: 15px !important;
    z-index: 10002 !important;
    max-width: 90% !important;
    text-align: center !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
    font-family: system-ui, -apple-system, sans-serif !important;
  `;
  
  errorDiv.innerHTML = `
    <h3 style="margin-bottom: 10px !important;">⚠️ ${title}</h3>
    <p style="margin-bottom: 15px !important; font-size: 14px !important;">${message.substring(0, 100)}${message.length > 100 ? '...' : ''}</p>
    <button onclick="this.parentElement.remove(); location.reload();" style="
      padding: 10px 20px !important;
      background: white !important;
      color: #ef4444 !important;
      border: none !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      font-weight: bold !important;
      margin-right: 10px !important;
    ">🔄 重新加载</button>
    <button onclick="this.parentElement.remove();" style="
      padding: 10px 20px !important;
      background: rgba(255,255,255,0.2) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      cursor: pointer !important;
    ">关闭</button>
  `;
  
  document.body.appendChild(errorDiv);
  
  // 5秒后自动移除
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 5000);
}

// 渲染应用
function renderApp() {
  console.log('开始渲染React应用');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('找不到root元素');
    showMobileError('初始化失败', '找不到应用容器元素');
    return;
  }
  
  try {
    // 清除加载占位符，但保留调试信息
    const loadingElement = document.getElementById('app-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    // 创建React根节点
    const root = createRoot(rootElement);
    
    // 渲染应用
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log('React应用渲染成功');
    
    // 通知加载完成
    if (typeof window.onAppLoaded === 'function') {
      window.onAppLoaded();
    }
    
    // 延迟验证渲染结果
    setTimeout(() => {
      const appContent = rootElement.querySelector('[class*="bg-"], [class*="min-h-"], div');
      if (!appContent) {
        console.warn('应用可能渲染失败，未找到预期的内容');
        showMobileError('渲染验证失败', '应用内容可能未正确显示');
      } else {
        console.log('应用渲染验证通过');
      }
    }, 2000);
    
  } catch (error) {
    console.error('React应用渲染失败:', error);
    showMobileError('渲染失败', error.message || '未知渲染错误');
    
    // 显示降级UI
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
        <h2 style="margin-bottom: 20px;">⚠️ 应用启动失败</h2>
        <p style="margin-bottom: 10px;">错误信息: ${error.message}</p>
        <p style="margin-bottom: 20px; font-size: 14px; opacity: 0.8;">
          这可能是由于浏览器兼容性问题导致的
        </p>
        <button onclick="location.reload()" style="
          padding: 15px 30px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin-bottom: 10px;
        ">🔄 重新加载应用</button>
        <button onclick="window.history.back()" style="
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        ">← 返回上一页</button>
      </div>
    `;
  }
}

// 初始化流程
console.log('开始初始化流程');
enhanceMobileCompatibility();
setupEnhancedErrorHandling();

// 确保DOM完全加载后再渲染
if (document.readyState === 'loading') {
  console.log('等待DOM加载完成');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始渲染应用');
    renderApp();
  });
} else {
  console.log('DOM已加载，立即渲染应用');
  renderApp();
}

console.log('=== React应用初始化脚本执行完成 ===');