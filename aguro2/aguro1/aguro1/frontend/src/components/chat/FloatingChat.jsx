import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Sparkles, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { chatAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const FloatingChat = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello Farmer! I am your AgroGuide Assistant. Ask me anything about crop suitability, pest management, weather advisories, or mandi prices in English, Malayalam, or Hindi.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'Which crop is suitable for my soil?',
    'What crops can I grow this season?',
    'How do I control banana stem borer organically?',
    'What are today\'s market prices?',
  ]);

  const { language } = useLanguage();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // All hooks must be declared before any conditional return
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Early return AFTER all hooks
  if (isAuthPage) return null;

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText.trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await chatAPI.sendMessage({
        message: query,
        language: language || 'en',
        conversation_history: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (res.data.suggested_questions?.length > 0) {
        setSuggestedQuestions(res.data.suggested_questions);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I apologize, but I had trouble reaching the advisory server. Please try again or consult a registered agronomist.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-chat-bubble"
        title="Chat with AgroGuide Assistant"
        aria-label="Open AgroGuide AI Assistant"
      >
        {isOpen ? <X size={26} /> : <Bot size={28} />}
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="floating-chat-window">
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--primary-900)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} color="#86efac" />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.1 }}>AgroGuide Assistant</h4>
                <span style={{ fontSize: '0.72rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                  Smart Farming AI
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--bg-main)',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: m.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    backgroundColor: m.role === 'user' ? 'var(--primary-700)' : '#ffffff',
                    color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                    boxShadow: 'var(--shadow-subtle)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border-light)',
                  }}
                >
                  {m.content}
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {m.time}
                </span>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#ffffff', borderRadius: '16px', alignSelf: 'flex-start', border: '1px solid var(--border-light)' }}>
                <RefreshCw size={14} className="spin-icon" color="var(--primary-700)" />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Consulting agricultural knowledge base...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Carousel */}
          {suggestedQuestions.length > 0 && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {suggestedQuestions.slice(0, 3).map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sq)}
                  style={{
                    background: 'var(--primary-50)',
                    border: '1px solid var(--primary-200)',
                    color: 'var(--primary-800)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                  }}
                >
                  {sq}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask crop, pest, or mandi question..."
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                padding: '10px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--border-light)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="btn btn-primary"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <Send size={18} />
            </button>
          </form>

          {/* Safety Disclaimer Banner */}
          <div style={{ padding: '6px 12px', backgroundColor: '#fefce8', borderTop: '1px solid #fef08a', fontSize: '0.68rem', color: '#854d0e', textAlign: 'center' }}>
            AgroGuide provides general guidance; consult your Krishi Bhavan officer for regulated chemicals.
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
