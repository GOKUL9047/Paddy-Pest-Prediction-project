// --- src/pages/Chatbot.tsx ---
import React, { useState } from 'react'; // <-- import useState properly

// Define types for chat messages
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const userMessage: ChatMessage = { sender: 'user', text: newMessage };
    setMessages((prevMessages: ChatMessage[]) => [...prevMessages, userMessage]); // type added
    setNewMessage('');
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const botResponseText: string = `Hello! You said: "${userMessage.text}". I am a simple chatbot. How can I assist you further?`;

      setMessages((prevMessages: ChatMessage[]) => [
        ...prevMessages,
        { sender: 'bot', text: botResponseText }
      ]);
    } catch (error) {
      console.error('Chatbot backend error:', error);
      setMessages((prevMessages: ChatMessage[]) => [
        ...prevMessages,
        { sender: 'bot', text: 'Sorry, I could not connect to the backend.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Toggle Chatbot"
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

      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl w-80 h-96 flex flex-col mt-4 border border-gray-200">
          <div className="bg-blue-500 text-white p-3 rounded-t-xl text-center font-bold">
            PestPredict Chat
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            {messages.length === 0 && (
              <p className="text-gray-500 text-center text-sm mt-4">Ask me anything!</p>
            )}
            {messages.map((msg: ChatMessage, index: number) => ( // types added
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                  msg.sender === 'user' ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-100 self-start mr-auto'
                }`}
              >
                <p className="text-sm text-gray-800">{msg.text}</p>
              </div>
            ))}
            {isTyping && (
              <div className="mb-2 p-2 rounded-lg bg-gray-100 self-start mr-auto">
                <p className="text-sm text-gray-500 italic">Bot is typing...</p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
