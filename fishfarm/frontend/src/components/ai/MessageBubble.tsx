import React, { useState } from 'react';
import StreamingMessage from './StreamingMessage';

interface MessageBubbleProps {
  role: 'USER' | 'ASSISTANT';
  message: string;
  createdAt: string;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, message, createdAt, isStreaming }) => {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'USER';

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseMarkdown = (raw: string): string => {
    return raw
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#1a1a2e;padding:12px;border-radius:8px;overflow-x:auto;margin:8px 0;font-family:monospace;font-size:13px;color:#e0e0e0"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h4 style="color:#fff;margin:12px 0 4px;font-size:14px">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 style="color:#fff;margin:14px 0 6px;font-size:15px">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 style="color:#fff;margin:16px 0 8px;font-size:16px">$1</h2>')
      .replace(/^- (.+)$/gm, '<li style="margin-left:16px;list-style:disc;margin-bottom:2px">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:16px;list-style:decimal;margin-bottom:2px">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  const timeStr = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 16,
      maxWidth: '100%',
    }}>
      {/* Avatar */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: isUser ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.15)'
      }}>
        {isUser ? '👤' : '🐟'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '85%', position: 'relative' }}>
        <div
          style={{
            background: isUser
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'rgba(255,255,255,0.05)',
            border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            padding: '12px 16px',
            color: '#fff',
            fontSize: 14,
            lineHeight: 1.6,
            backdropFilter: isUser ? 'none' : 'blur(10px)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            const copyBtn = e.currentTarget.querySelector('.copy-btn') as HTMLElement;
            if (copyBtn) copyBtn.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            const copyBtn = e.currentTarget.querySelector('.copy-btn') as HTMLElement;
            if (copyBtn) copyBtn.style.opacity = '0';
          }}
        >
          {!isUser && isStreaming ? (
            <StreamingMessage text={message} isStreaming={true} />
          ) : isUser ? (
            <span>{message}</span>
          ) : (
            <div
              style={{ color: '#e0e0e0', wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message) }}
            />
          )}

          {!isUser && !isStreaming && (
            <button
              className="copy-btn"
              onClick={handleCopy}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6,
                padding: '4px 8px',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: 11,
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <div style={{
          fontSize: 11,
          color: '#666',
          marginTop: 4,
          textAlign: isUser ? 'right' : 'left',
          paddingLeft: isUser ? 0 : 4,
          paddingRight: isUser ? 4 : 0,
        }}>
          {timeStr}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
