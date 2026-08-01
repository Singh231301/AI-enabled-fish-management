import React from 'react';

interface StreamingMessageProps {
  text: string;
  isStreaming: boolean;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({ text, isStreaming }) => {
  const parseMarkdown = (raw: string): string => {
    let html = raw
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
    return html;
  };

  if (isStreaming && !text) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0' }}>
        <style>{`
          @keyframes aiBounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-6px); }
          }
        `}</style>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'inline-block',
              animation: `aiBounce 1.4s ease-in-out ${i * 0.16}s infinite`
            }}
          />
        ))}
        <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>Thinking...</span>
      </div>
    );
  }

  return (
    <div
      style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word' }}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
    />
  );
};

export default StreamingMessage;
