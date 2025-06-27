import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, ChevronUp, ChevronDown } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUsername: string;
  onSendMessage: (content: string) => void;
  onAddMedia?: () => void;
  onDeleteCurrentMedia?: () => void;
  onPauseAutoPlay?: () => void;
  hasCurrentMedia?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUsername,
  onSendMessage,
  onAddMedia,
  onDeleteCurrentMedia,
  onPauseAutoPlay,
  hasCurrentMedia = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const byteLength = new TextEncoder().encode(inputValue).length;
  const isValid = inputValue.trim().length > 0 && byteLength <= 120;

  useEffect(() => {
    // 自动滚动到最新消息
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition(target.scrollTop);
  };

  const scrollUp = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollBy({ top: -60, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollBy({ top: 60, behavior: 'smooth' });
    }
  };

  const canScrollUp = scrollPosition > 0;
  const canScrollDown = messagesContainerRef.current 
    ? scrollPosition < messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight 
    : false;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
      {/* Chat Messages - 整个对话框靠左贴边 */}
      <div className="mb-4 relative" style={{ marginLeft: '0', marginRight: 'auto', width: '66.67%' }}>
        {/* 左侧滚动控制按钮 - 宽度缩小一半 */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-10">
          <button
            onClick={scrollUp}
            disabled={!canScrollUp}
            className={`w-4 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              canScrollUp 
                ? 'bg-white/20 hover:bg-white/30 text-white' 
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          
          <button
            onClick={scrollDown}
            disabled={!canScrollDown}
            className={`w-4 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              canScrollDown 
                ? 'bg-white/20 hover:bg-white/30 text-white' 
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Messages List - 滑动按钮和文字信息之间的间距缩小一半 */}
        <div 
          ref={messagesContainerRef}
          className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide pl-6"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onScroll={handleScroll}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className="block bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 text-white w-fit max-w-full"
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                lineHeight: '1.2'
              }}
            >
              <span className="font-medium text-blue-400 text-sm">{message.username}</span>
              <span className="text-white/70 text-sm">: </span>
              <span className="break-words text-sm">{message.content}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form - 移除了媒体控制按钮 */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="说点什么吧..."
            className="w-full px-4 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center"
            maxLength={200}
            style={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'left'
            }}
          />
          <div 
            className="absolute right-3 text-xs text-white/60 flex items-center"
            style={{
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            {byteLength}/120
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!isValid}
          className={`px-6 py-1.5 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
            isValid
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="h-5 w-5" />
          <span>发送</span>
        </button>
      </form>

      {/* 添加CSS样式来隐藏滚动条 */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;