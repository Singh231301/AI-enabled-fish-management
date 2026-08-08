import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, Activity, Droplets, CheckSquare, AlertCircle } from 'lucide-react';
import { PondBasicStats } from '../../types/dashboard.types';
import { aiApi } from '../../api/endpoints/ai.api';
import { useNavigate } from 'react-router-dom';

interface AIBriefingPanelProps {
  pondId: string | null;
  fishAgeDays: number;
  species: string | null;
  basicStats: PondBasicStats;
}

export const AIBriefingPanel: React.FC<AIBriefingPanelProps> = ({ pondId, fishAgeDays, species, basicStats }) => {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const fetchBriefing = async () => {
    if (!pondId) return;
    try {
      setIsLoading(true);
      setHasError(false);
      const res = await aiApi.getDailyBriefing(pondId);
      if (res?.content) {
        setBriefing(res.content);
        setLastGeneratedAt(res.createdAt);
      } else {
        setBriefing(null);
      }
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [pondId]);

  const generateBriefing = async () => {
    if (!pondId) return;
    try {
      setIsGenerating(true);
      setHasError(false);
      
      const res = await aiApi.generateDailyBriefing({ pondId, forceRegenerate: true });
      if (res?.content) {
        setBriefing(res.content);
        setLastGeneratedAt(res.createdAt);
      }
    } catch (err) {
      setHasError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to format briefing text - make lines starting with emojis slightly larger
  const renderBriefingText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const startsWithEmoji = /^[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/.test(line.trim());
      
      if (startsWithEmoji) {
        return (
          <p key={idx} className="mb-2 text-base font-medium text-slate-200">
            {line}
          </p>
        );
      }
      return (
        <p key={idx} className="mb-2 text-sm text-slate-300">
          {line}
        </p>
      );
    });
  };

  const getTodayLabel = () => {
    const today = new Date();
    return `Today, ${today.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
  };

  if (isLoading && !briefing) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 w-full animate-pulse h-[280px]">
        <div className="flex justify-between items-center mb-6">
          <div className="w-32 h-6 bg-slate-700 rounded"></div>
          <div className="w-24 h-6 bg-slate-700 rounded-full"></div>
        </div>
        <div className="space-y-3">
          <div className="w-full h-4 bg-slate-700 rounded"></div>
          <div className="w-5/6 h-4 bg-slate-700 rounded"></div>
          <div className="w-4/6 h-4 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-600 shadow-lg flex flex-col h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="bg-sky-500/20 p-2 rounded-lg">
            <Bot className="text-sky-400" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white leading-none">AI Daily Briefing</h3>
            <div className="text-[11px] text-sky-400 font-medium mt-1 tracking-wider uppercase">
              {getTodayLabel()}
            </div>
          </div>
        </div>
        
        {briefing && !isGenerating && (
          <button 
            onClick={generateBriefing}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
            title="Generate new briefing"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {hasError ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="text-slate-300 mb-4">Could not load your AI briefing.</p>
            <button 
              onClick={fetchBriefing}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-200"
            >
              Try Again
            </button>
          </div>
        ) : isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            <div className="flex gap-1 mb-4">
              <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-sky-300 font-medium animate-pulse">Analyzing your farm data...</p>
            <div className="w-48 h-1.5 bg-slate-700 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-sky-500 w-1/2 animate-pulse rounded-full"></div>
            </div>
          </div>
        ) : !briefing ? (
          <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
            <div className="text-6xl mb-4 drop-shadow-lg">🤖</div>
            <h4 className="text-white font-medium mb-2">Get your AI-powered farm briefing</h4>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              Based on your fish age, water quality, feeding history, and weather conditions.
            </p>
            <button 
              onClick={generateBriefing}
              className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-sky-500/20"
            >
              Generate Today's Briefing
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-4 flex-1">
              {renderBriefingText(briefing)}
            </div>
            
            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-2 mt-auto">
              <button onClick={() => navigate('/fish')} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium transition-colors">
                <Activity size={12} /> View Fish
              </button>
              <button onClick={() => navigate('/water')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 rounded-full text-xs font-medium transition-colors">
                <Droplets size={12} /> Check Water
              </button>
              <button onClick={() => navigate('/tasks')} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-300 rounded-full text-xs font-medium transition-colors">
                <CheckSquare size={12} /> View Tasks
              </button>
              <button onClick={() => navigate('/ai')} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 rounded-full text-xs font-medium transition-colors">
                <Bot size={12} /> Ask AI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
        {lastGeneratedAt ? (
          <div className="text-[10px] text-slate-500">
            Generated at {new Date(lastGeneratedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        ) : <div />}
        
        <button 
          onClick={() => navigate('/ai')}
          className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors flex items-center gap-1"
        >
          Ask the AI anything &rarr;
        </button>
      </div>
    </div>
  );
};
