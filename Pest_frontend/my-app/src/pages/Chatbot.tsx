import React, { useState } from 'react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string): string => {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mt-3 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-800 mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-800 mt-4 mb-3">$1</h1>')
    
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    
    // Bullet points
    .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
    
    // Line breaks
    .replace(/\n/g, '<br />');
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const userMessage: ChatMessage = { sender: 'user', text: newMessage };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      // Send request to FastAPI backend
      const formData = new FormData();
      formData.append('text', userMessage.text);

      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to connect to backend');
      const data = await response.json();

      const botResponseText: string = data.response || "Sorry, I couldn't generate a response.";

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: botResponseText },
      ]);
    } catch (error) {
      console.error('Chatbot backend error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: '⚠️ Sorry, could not connect to the backend.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300"
        aria-label="Toggle Agricultural Assistant"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          )}
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl w-[500px] h-[600px] flex flex-col mt-4 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-xl text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🌾</span>
              <div>
                <h3 className="font-bold text-lg">Agricultural Assistant</h3>
                <p className="text-sm text-green-100">Ask about farming, crops & pests</p>
              </div>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <div className="text-6xl mb-4">🌱</div>
                <p className="text-gray-600 text-sm mb-2">Welcome to Agricultural Assistant!</p>
                <p className="text-gray-500 text-xs">Ask me about farming, pests, crops, or agricultural practices.</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-green-500 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'bot' ? (
                    <div 
                      className="text-sm text-gray-800 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: parseMarkdown(msg.text) 
                      }}
                    />
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">Agricultural expert is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-800 text-sm"
                placeholder="Ask about crops, pests, farming..."
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={isTyping || newMessage.trim() === ''}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
        
        .prose h1, .prose h2, .prose h3 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .prose li {
          margin-bottom: 0.25rem;
        }
        
        .prose strong {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;