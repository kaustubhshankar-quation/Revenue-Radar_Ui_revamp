import React, { useState } from 'react';
import { FaCommentDots, FaPaperPlane } from 'react-icons/fa';
import './DemoChatBox.css'; // We'll define the CSS next

const DemoChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! Welcome to the FMCG Dashboard.' },
    { type: 'bot', text: 'This is a demo chat box.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { type: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: 'bot', text: 'Thanks for your message!' }]);
    }, 1000);
  };

  return (
    <div>
      {/* Chat Icon Button */}
      <div
        className={`chat-icon ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaCommentDots size={24} />
      </div>

      {/* Chat Box */}
      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <span>💬 Support Chat</span>
            <span onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}>✕</span>
          </div>
          <div className="chat-body">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.type === 'user' ? 'user' : 'bot'}`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}><FaPaperPlane /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoChatBox;