import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUsername: string;
  onSendMessage: (content: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUsername,
  onSendMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const byteLength = new TextEncoder().encode(inputValue).length;
  const isValid = inputValue.trim().length > 0 && byteLength <= 120;

  useEffect(() => {
    // 自动滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
      {/* Chat Messages - 高度缩小一半，宽度向左缩小三分之一 */}
      <div className="mb-4 mr-[33%]">
        {/* Messages List - 移除滚动条背景，高度从max-h-64改为max-h-32 */}
        <div 
          ref={messagesContainerRef}
          className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide"
          style={{
            /* 隐藏滚动条但保持滚动功能 */
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE and Edge */
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className="inline-block bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 text-white max-w-full"
              style={{
                /* 消息背景根据文字长度自动调节，文字超出时自动换行 */
                width: 'fit-content',
                maxWidth: '100%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto'
              }}
            >
              <span className="font-medium text-blue-400">{message.username}</span>
              <span className="text-white/70">: </span>
              <span className="break-words">{message.content}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
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