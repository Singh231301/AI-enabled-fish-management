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
  const [externalQuery, setExternalQuery] = useState<{ text: string; timestamp: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3 px-3 py-2 md:px-6 md:py-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryOpen(true)}
              className="bg-white/5 border border-white/10 rounded-lg p-2 text-slate-400 hover:bg-white/10 transition-all"
            >
              💬
            </button>
            <div className="hidden sm:block">
              <h1 className="text-white m-0 text-lg font-bold">AI Assistant</h1>
            </div>
          </div>

          {/* Pond Selector (Mobile: Right aligned in first row) */}
          <select
            value={selectedPondId || ''}
            onChange={handlePondChange}
            className="md:hidden bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs cursor-pointer outline-none min-w-[120px]"
          >
            <option value="" className="bg-slate-900">Select Pond...</option>
            {ponds.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          {/* Pond Selector (Desktop) */}
          <select
            value={selectedPondId || ''}
            onChange={handlePondChange}
            className="hidden md:block bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm cursor-pointer outline-none min-w-[160px]"
          >
            <option value="" className="bg-slate-900">Select Pond...</option>
            {ponds.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
            ))}
          </select>

          {/* Tab Switcher */}
          <div className="flex bg-white/5 rounded-lg p-1 gap-1 w-full md:w-auto overflow-x-auto hide-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none border-none rounded-md px-3 py-1.5 cursor-pointer text-xs sm:text-sm whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold' 
                    : 'bg-transparent text-slate-400 font-normal hover:bg-white/5'
                }`}
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
                externalQuery={externalQuery}
              />
            </div>

            {/* Right Sidebar - Suggestions */}
            {selectedPondId && (
              <>
                {!isSidebarOpen && (
                  <div style={{
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    padding: '16px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.3)'
                  }}>
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, padding: 8, borderRadius: 8 }}
                      title="Show Suggestions"
                    >
                      💡
                    </button>
                  </div>
                )}
                {isSidebarOpen && (
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>
                        💡 Suggested Questions
                      </h3>
                      <button 
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16, padding: '4px 8px', borderRadius: 4 }}
                        title="Close Suggestions"
                      >
                        ✕
                      </button>
                    </div>
                    <SuggestedQuestions
                  pondId={selectedPondId}
                  onSelect={(q) => setExternalQuery({ text: q, timestamp: Date.now() })}
                />
                <FarmHealthScore pondId={selectedPondId} />
                  </div>
                )}
              </>
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
