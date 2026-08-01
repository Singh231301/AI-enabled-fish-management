import React, { useState, useEffect } from 'react';
import ChatInterface from '../../components/ai/ChatInterface';
import DailyBriefingCard from '../../components/ai/DailyBriefingCard';
import WeeklyReportCard from '../../components/ai/WeeklyReportCard';
import AIInsightsPanel from '../../components/ai/AIInsightsPanel';
import FarmHealthScore from '../../components/ai/FarmHealthScore';
import SuggestedQuestions from '../../components/ai/SuggestedQuestions';
import ConversationHistory from '../../components/ai/ConversationHistory';
import { pondApi } from '../../api/endpoints/pond.api';

interface Pond {
  id: string;
  name: string;
}

const TABS = ['Chat', 'Briefings', 'Insights'] as const;

export const AIChatPage: React.FC = () => {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<string | null>(null);
  const [selectedPondName, setSelectedPondName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Chat');
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await pondApi.getUserPonds();
        const pondData = res.data || [];
        setPonds(pondData);
        if (pondData.length > 0) {
          setSelectedPondId(pondData[0].id);
          setSelectedPondName(pondData[0].name);
        }
      } catch {
        setPonds([]);
      }
    };
    load();
  }, []);

  const handlePondChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPondId(id || null);
    const pond = ponds.find(p => p.id === id);
    setSelectedPondName(pond?.name || '');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      background: 'transparent',
    }}>
      {/* Page Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setHistoryOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            💬
          </button>
          <div>
            <h1 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 700 }}>AI Assistant</h1>
            <p style={{ color: '#888', margin: 0, fontSize: 12 }}>
              Powered by Google Gemini • Context-aware farm advisor
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Pond Selector */}
          <select
            value={selectedPondId || ''}
            onChange={handlePondChange}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#fff',
              fontSize: 13,
              cursor: 'pointer',
              outline: 'none',
              minWidth: 160,
            }}
          >
            <option value="" style={{ background: '#1a1a2e' }}>Select Pond...</option>
            {ponds.map(p => (
              <option key={p.id} value={p.id} style={{ background: '#1a1a2e' }}>{p.name}</option>
            ))}
          </select>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: activeTab === tab ? '#fff' : '#888',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: activeTab === tab ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {tab === 'Chat' && '💬 '}
                {tab === 'Briefings' && '📊 '}
                {tab === 'Insights' && '💡 '}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {activeTab === 'Chat' && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Main Chat */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <ChatInterface
                pondId={selectedPondId}
                selectedPondName={selectedPondName}
              />
            </div>

            {/* Right Sidebar - Suggestions */}
            {selectedPondId && (
              <div style={{
                width: 320,
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                overflowY: 'auto',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                scrollbarWidth: 'thin',
              }}>
                <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>
                  💡 Suggested Questions
                </h3>
                <SuggestedQuestions
                  pondId={selectedPondId}
                  onSelect={() => {}}
                />
                <FarmHealthScore pondId={selectedPondId} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'Briefings' && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            scrollbarWidth: 'thin',
          }}>
            {selectedPondId ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 20,
                maxWidth: 1200,
              }}>
                <DailyBriefingCard pondId={selectedPondId} />
                <WeeklyReportCard pondId={selectedPondId} />
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 0',
                color: '#888',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                <h3 style={{ color: '#aaa', margin: '0 0 8px', fontSize: 16 }}>Select a Pond</h3>
                <p style={{ margin: 0, fontSize: 14 }}>Choose a pond above to view AI-generated briefings and reports.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Insights' && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            scrollbarWidth: 'thin',
          }}>
            {selectedPondId ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: 20,
                maxWidth: 1200,
              }}>
                <div>
                  <AIInsightsPanel pondId={selectedPondId} />
                </div>
                <div>
                  <FarmHealthScore pondId={selectedPondId} />
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 0',
                color: '#888',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💡</div>
                <h3 style={{ color: '#aaa', margin: '0 0 8px', fontSize: 16 }}>Select a Pond</h3>
                <p style={{ margin: 0, fontSize: 14 }}>Choose a pond above to view AI insights and farm health score.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conversation History Panel */}
      <ConversationHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectSession={() => {}}
      />
    </div>
  );
};

export default AIChatPage;
