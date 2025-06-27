import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, ChevronUp, ChevronDown } from 'lucide-react';

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
  const [showHistory, setShowHistory] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const byteLength = new TextEncoder().encode(inputValue).length;
  const isValid = inputValue.trim().length > 0 && byteLength <= 120;

  useEffect(() => {
    if (!showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const displayedMessages = showHistory 
    ? messages.slice(-visibleCount) 
    : messages.slice(-6);

  const canShowMore = messages.length > visibleCount;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black from-opacity-90 to-transparent p-4">
      {/* Chat Messages */}
      <div className="mb-4">
        {/* History Navigation */}
        {messages.length > 6 && (
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white text-sm hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-1"
            >
              {showHistory ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              <span>{showHistory ? '收起历史' : '查看历史'}</span>
            </button>
          </div>
        )}

        {showHistory && canShowMore && (
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setVisibleCount(prev => Math.min(prev + 10, messages.length))}
              className="px-3 py-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-full text-white text-opacity-70 text-sm hover:bg-opacity-20 transition-all duration-200"
            >
              加载更多消息
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {displayedMessages.map((message) => (
            <div
              key={message.id}
              className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg px-3 py-2 text-white"
            >
              <span className="font-medium text-blue-400">{message.username}</span>
              <span className="text-white text-opacity-70">: </span>
              <span>{message.content}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="说点什么吧..."
            className="w-full px-4 py-1.5 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center"
            maxLength={200}
            style={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'left'
            }}
          />
          <div 
            className="absolute right-3 text-xs text-white text-opacity-60 flex items-center"
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
    </div>
  );
};

export default ChatPanel;