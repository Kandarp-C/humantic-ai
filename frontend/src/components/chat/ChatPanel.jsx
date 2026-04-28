import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatSessions, createChatSession, getChatMessages, sendChatMessage } from '../../services/api';
import './ChatPanel.css';

const ChatPanel = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSession) {
      loadMessages(activeSession.id);
    }
  }, [activeSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const res = await getChatSessions();
      setSessions(res.data);
      if (res.data.length > 0 && !activeSession) {
        setActiveSession(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  const loadMessages = async (sessionId) => {
    try {
      const res = await getChatMessages(sessionId);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await createChatSession();
      setSessions([res.data, ...sessions]);
      setActiveSession(res.data);
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSession || isSending) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const res = await sendChatMessage(activeSession.id, input);
      setMessages(prev => [...prev, res]);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-panel glass-panel">
      <div className="chat-sidebar">
        <button className="new-chat-btn" onClick={handleCreateSession}>+ New Chat</button>
        <div className="sessions-list">
          {sessions.map(s => (
            <div 
              key={s.id} 
              className={`session-item ${activeSession?.id === s.id ? 'active' : ''}`}
              onClick={() => setActiveSession(s)}
            >
              {s.title || 'Untitled'}
            </div>
          ))}
        </div>
      </div>
      
      <div className="chat-main">
        <div className="chat-messages">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message ${m.role}`}
              >
                <div className="message-bubble">
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isSending}
          />
          <button type="submit" disabled={isSending}>
            {isSending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;