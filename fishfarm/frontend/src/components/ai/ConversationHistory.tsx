import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api/endpoints/ai.api';
import { SessionSummary } from '../../types/ai.types';

interface ConversationHistoryProps {
  onSelectSession: (sessionId: string) => void;
  currentSessionId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onSelectSession,
  currentSessionId,
  isOpen,
  onClose,
}) => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await aiApi.getChatHistory({});
        setSessions(data.sessions);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isOpen]);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      setDeletingId(sessionId);
      await aiApi.clearSession(sessionId);
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: 300,
        background: 'rgba(15,15,26,0.98)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <h3 style={{ color: '#fff', margin: 0, fontSize: 15, fontWeight: 600 }}>💬 Chat History</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: 18,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* New Chat */}
        <div style={{ padding: '12px 16px', flexShrink: 0 }}>
          <button
            onClick={() => { onSelectSession(''); onClose(); }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 16px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            ✨ New Conversation
          </button>
        </div>

        {/* Sessions List */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
              <p style={{ color: '#666', fontSize: 13 }}>No conversations yet</p>
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={session.sessionId}
                onClick={() => { onSelectSession(session.sessionId); onClose(); }}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  background: currentSessionId === session.sessionId ? 'rgba(102,126,234,0.1)' : 'transparent',
                  borderLeft: currentSessionId === session.sessionId ? '3px solid #667eea' : '3px solid transparent',
                  transition: 'all 0.15s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (currentSessionId !== session.sessionId) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentSessionId !== session.sessionId) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: '#ddd',
                    fontSize: 13,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {session.firstMessage}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <span style={{ color: '#666', fontSize: 11 }}>{formatDate(session.startedAt)}</span>
                    <span style={{ color: '#555', fontSize: 11 }}>•</span>
                    <span style={{ color: '#666', fontSize: 11 }}>{session.messageCount} msgs</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(session.sessionId, e)}
                  disabled={deletingId === session.sessionId}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#555',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#555'}
                >
                  {deletingId === session.sessionId ? '⏳' : '🗑️'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ConversationHistory;
