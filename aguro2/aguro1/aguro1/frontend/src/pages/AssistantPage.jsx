import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { chatAPI } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  ShieldAlert,
  User,
  RefreshCw,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Which crop is suitable for my soil and location?',
  'What crops can I grow this season in Kerala?',
  'How can I identify and manage banana pseudostem weevil organically?',
  'How can I check today\'s mandi market prices for pepper and cardamom?',
  'What key agronomic practices should I consider before planting paddy?',
  'How to prepare Jeevamrutha organic fertilizer at home?'
];

const AssistantPage = () => {
  const { language } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello Farmer! I am your 24/7 AgroGuide Agricultural Assistant. How can I assist your farming operations today? You can ask in English, Malayalam (മലയാളം), or Hindi (हिन्दी).',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState(SUGGESTED_PROMPTS);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (text) => {
    const query = text || inputText.trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInputText('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage({
        message: query,
        language: language || 'en',
        conversation_history: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (res.data.suggested_questions?.length > 0) {
        setSuggested(res.data.suggested_questions);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Unable to connect to the knowledge engine right now. Please try again shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'Conversation history cleared. How can I help you today with your farming queries?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 140px)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-950)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={28} color="var(--primary-700)" />
            <span>AgroGuide Assistant</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            AI-powered multilingual agricultural knowledge system with offline fallback capability.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Trash2 size={15} color="#dc2626" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Box Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid var(--border-light)',
        }}
      >
        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--bg-main)',
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: m.role === 'user' ? 'var(--primary-800)' : 'var(--primary-700)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {m.role === 'user' ? <User size={18} /> : <Bot size={20} color="#86efac" />}
              </div>

              <div>
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: m.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    backgroundColor: m.role === 'user' ? 'var(--primary-700)' : '#ffffff',
                    color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: 'var(--shadow-subtle)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border-light)',
                    fontSize: '0.94rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {m.content}
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                    display: 'block',
                    textAlign: m.role === 'user' ? 'right' : 'left',
                  }}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', backgroundColor: '#ffffff', borderRadius: '16px', alignSelf: 'flex-start', border: '1px solid var(--border-light)' }}>
              <RefreshCw size={16} className="spin-icon" color="var(--primary-700)" />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Synthesizing agronomic response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {suggested.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} color="var(--primary-700)" />
              Suggested:
            </span>
            {suggested.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: '1px solid var(--primary-200)',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-900)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: '12px',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your agricultural question here..."
            style={{
              flex: 1,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              padding: '12px 18px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--border-light)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="btn btn-primary"
            style={{ padding: '0 24px', borderRadius: 'var(--radius-full)' }}
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </form>

        {/* Safety Notice Bar */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#fefce8',
            borderTop: '1px solid #fef08a',
            fontSize: '0.75rem',
            color: '#854d0e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldAlert size={14} color="#ca8a04" />
          <span>
            AgroGuide provides general agricultural information and does not replace advice from a qualified agricultural professional or local Krishi Bhavan.
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
