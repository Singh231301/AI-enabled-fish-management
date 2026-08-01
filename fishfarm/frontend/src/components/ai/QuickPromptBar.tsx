import React from 'react';

const QUICK_PROMPTS = [
  { emoji: '📋', text: "What should I do today?" },
  { emoji: '🐟', text: "How are my fish doing?" },
  { emoji: '🍽️', text: "How much should I feed today?" },
  { emoji: '💧', text: "Is my water quality OK?" },
  { emoji: '🤒', text: "Signs of fish disease?" },
  { emoji: '🌡️', text: "Weather impact on my pond?" },
  { emoji: '📊', text: "How to improve FCR?" },
  { emoji: '💰', text: "Expected profit at harvest?" },
];

interface QuickPromptBarProps {
  onSelect: (prompt: string) => void;
}

const QuickPromptBar: React.FC<QuickPromptBarProps> = ({ onSelect }) => {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      padding: '4px 0',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      <style>{`.quick-prompt-bar::-webkit-scrollbar { display: none; }`}</style>
      {QUICK_PROMPTS.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelect(prompt.text)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20,
            padding: '8px 16px',
            color: '#ccc',
            cursor: 'pointer',
            fontSize: 13,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(102,126,234,0.4)';
            e.currentTarget.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span>{prompt.emoji}</span>
          <span>{prompt.text}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickPromptBar;
