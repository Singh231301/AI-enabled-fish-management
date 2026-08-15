import React, { useState } from 'react';
import { Clock, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const FeedingScheduleTab: React.FC = () => {
  const [defaultFeedType, setDefaultFeedType] = useState('Floating Pellets (Standard)');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  return (
    <div className="flex flex-col gap-6 text-slate-200">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-4 rounded-lg mb-6 text-sm leading-relaxed">
          <strong>Note:</strong> Detailed feeding schedules, amounts, and logs are managed per-pond within the <strong>Feeding</strong> section of the app. This section allows you to configure global feeding defaults.
        </div>

        <h3 className="text-lg font-semibold mb-6">Global Feeding Settings</h3>
        
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-semibold text-slate-300">Default Feed Type</label>
          <select 
            className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full max-w-[300px] focus:border-blue-500 transition-colors" 
            value={defaultFeedType} 
            onChange={(e) => setDefaultFeedType(e.target.value)}
          >
            <option className="bg-slate-800" value="Floating Pellets (Standard)">Floating Pellets (Standard)</option>
            <option className="bg-slate-800" value="Sinking Pellets">Sinking Pellets</option>
            <option className="bg-slate-800" value="Starter Crumbles">Starter Crumbles</option>
            <option className="bg-slate-800" value="Medicinal Feed">Medicinal Feed</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-300">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
            />
            Enable Global Feeding Reminders
          </label>
        </div>

        <button 
          className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition inline-block w-full md:w-auto" 
          onClick={() => toast.success('Saved global feeding settings.')}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
