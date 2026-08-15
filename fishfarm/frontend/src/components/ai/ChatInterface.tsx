import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import QuickPromptBar from './QuickPromptBar';
import { aiApi } from '../../api/endpoints/ai.api';

interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  message: string;
  createdAt: string;
  sessionId: string;
}

interface ChatInterfaceProps {
  pondId: string | null;
  selectedPondName?: string;
  externalQuery?: { text: string; timestamp: number } | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ pondId, selectedPondName, externalQuery }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<'en' | 'hinglish'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (externalQuery?.text && !isLoading && !isStreaming) {
      handleSend(externalQuery.text);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery?.timestamp]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading || isStreaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'USER',
      message: text,
      createdAt: new Date().toISOString(),
      sessionId: sessionId || ''
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiMsgId = crypto.randomUUID();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'ASSISTANT',
      message: '',
      createdAt: new Date().toISOString(),
      sessionId: sessionId || ''
    };

    setMessages(prev => [...prev, aiMsg]);

    const token = localStorage.getItem('fishfarm_token') || '';

    try {
      setIsStreaming(true);
      setIsLoading(false);

      await aiApi.sendMessageStream(
        {
          pondId: pondId || undefined,
          message: text,
          sessionId,
          language
        },
        token,
        (chunk: string) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMsgId ? { ...m, message: m.message + chunk } : m
            )
          );
        },
        (fullText: string, newSessionId: string) => {
          setSessionId(newSessionId);
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMsgId ? { ...m, message: fullText, sessionId: newSessionId } : m
            )
          );
          setIsStreaming(false);
        },
        (error: string) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMsgId ? { ...m, message: `⚠️ Error: ${error}. Please try again.` } : m
            )
          );
          setIsStreaming(false);
        }
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId ? { ...m, message: '⚠️ Failed to connect to AI service.' } : m
        )
      );
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(undefined);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🐟</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>FishFarm AI</div>
            <div style={{ color: '#888', fontSize: 12 }}>
              {selectedPondName ? `Context: ${selectedPondName}` : 'Select a pond for context-aware advice'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setLanguage(l => l === 'en' ? 'hinglish' : 'en')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '6px 12px',
              color: '#ccc',
              cursor: 'pointer',
              fontSize: 12,
              transition: 'all 0.2s',
            }}
            title="Toggle language"
          >
            {language === 'en' ? '🇮🇳 Hinglish' : '🇬🇧 English'}
          </button>
          <button
            onClick={handleNewChat}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            + New Chat
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 20px 10px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.15) transparent',
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            gap: 16,
          }}>
            <div style={{ fontSize: 56 }}>🐟</div>
            <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 20, margin: 0 }}>
              Welcome to FishFarm AI
            </h3>
            <p style={{ color: '#888', fontSize: 14, maxWidth: 400, lineHeight: 1.6, margin: 0 }}>
              Ask me anything about your fish farm — feeding schedules, water quality,
              disease prevention, harvest planning, and more.
              {pondId ? '' : ' Select a pond for personalized advice.'}
            </p>
            <QuickPromptBar onSelect={(prompt) => handleSend(prompt)} />
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              message={msg.message}
              createdAt={msg.createdAt}
              isStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'ASSISTANT'}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts when messages exist */}
      {messages.length > 0 && !isStreaming && (
        <div style={{ padding: '0 20px 8px', flexShrink: 0 }}>
          <QuickPromptBar onSelect={(prompt) => handleSend(prompt)} />
        </div>
      )}

      {/* Input Area */}
      <div style={{
        padding: '12px 20px 16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pondId ? "Ask about your fish farm..." : "Select a pond first, or ask a general question..."}
            rows={1}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: '12px 16px',
              color: '#fff',
              fontSize: 14,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              maxHeight: 120,
              lineHeight: 1.5,
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(102,126,234,0.5)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isStreaming}
            style={{
              background: (!input.trim() || isLoading || isStreaming)
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: 12,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!input.trim() || isLoading || isStreaming) ? 'not-allowed' : 'pointer',
              color: '#fff',
              fontSize: 18,
              transition: 'all 0.2s',
              flexShrink: 0,
              opacity: (!input.trim() || isLoading || isStreaming) ? 0.5 : 1,
            }}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
