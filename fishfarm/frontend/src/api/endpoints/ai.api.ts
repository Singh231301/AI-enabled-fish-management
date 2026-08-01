import axiosInstance from '../axios';
import {
  AiBriefing,
  AIInsight,
  SuggestedQuestion,
  FarmHealthScore,
  SessionSummary,
  ChatMessage
} from '../../types/ai.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const aiApi = {
  // Chat
  sendMessage: async (data: { pondId?: string, message: string, sessionId?: string, language?: string }) => {
    const response = await axiosInstance.post('/ai/chat', data);
    return response.data.data;
  },

  // Streaming Chat (uses native fetch instead of axios to handle streams)
  sendMessageStream: async (
    data: { pondId?: string, message: string, sessionId?: string, language?: string },
    token: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string, sessionId: string) => void,
    onError: (error: string) => void
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (!response.body) {
        throw new Error('ReadableStream not yet supported in this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'chunk') {
                onChunk(parsed.text);
              } else if (parsed.type === 'done') {
                onComplete(parsed.text, parsed.sessionId);
              } else if (parsed.type === 'error') {
                onError(parsed.message);
              }
            } catch (e) {
              console.error("Error parsing stream chunk:", e);
            }
          }
        }
      }
    } catch (error: any) {
      onError(error.message);
    }
  },

  getChatHistory: async (params: { pondId?: string, sessionId?: string, page?: number, limit?: number }) => {
    const response = await axiosInstance.get<{ data: { records: ChatMessage[], total: number, sessions: SessionSummary[] } }>('/ai/chat/history', { params });
    return response.data.data;
  },

  clearSession: async (sessionId: string) => {
    const response = await axiosInstance.delete(`/ai/chat/session/${sessionId}`);
    return response.data.data;
  },

  // Briefings
  getDailyBriefing: async (pondId: string) => {
    const response = await axiosInstance.get<{ data: AiBriefing }>('/ai/briefing/daily', { params: { pondId } });
    return response.data.data;
  },

  generateDailyBriefing: async (data: { pondId: string, forceRegenerate?: boolean }) => {
    const response = await axiosInstance.post<{ data: AiBriefing }>('/ai/briefing/generate', data);
    return response.data.data;
  },

  getWeeklyReport: async (pondId: string) => {
    const response = await axiosInstance.get<{ data: AiBriefing }>('/ai/briefing/weekly', { params: { pondId } });
    return response.data.data;
  },

  // Insights & Suggestions
  getInsights: async (params: { pondId: string, module?: string }) => {
    const response = await axiosInstance.get<{ data: AIInsight[] }>('/ai/insights', { params });
    return response.data.data;
  },

  getSuggestedQuestions: async (pondId: string) => {
    const response = await axiosInstance.get<{ data: SuggestedQuestion[] }>('/ai/suggestions', { params: { pondId } });
    return response.data.data;
  },

  getFarmHealthScore: async (pondId: string) => {
    const response = await axiosInstance.get<{ data: FarmHealthScore }>('/ai/health-score', { params: { pondId } });
    return response.data.data;
  }
};
