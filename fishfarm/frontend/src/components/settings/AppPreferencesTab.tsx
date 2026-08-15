import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export const AppPreferencesTab: React.FC = () => {
  const [preferences, setPreferences] = useState({
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    weightUnit: 'kg',
    currency: 'INR',
    theme: 'dark',
    dashboardRefreshMinutes: 5,
    showWeatherWidget: true,
    showAiBriefing: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      toast.success('App preferences saved.');
    } catch (error) {
      toast.error('Failed to save app preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-200">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-6">General Preferences</h3>
        
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Language</label>
            <select name="language" className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors" value={preferences.language} onChange={handleChange}>
              <option className="bg-slate-800" value="en">English</option>
              <option className="bg-slate-800" value="es">Spanish</option>
              <option className="bg-slate-800" value="fr">French</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Date Format</label>
            <select name="dateFormat" className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors" value={preferences.dateFormat} onChange={handleChange}>
              <option className="bg-slate-800" value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option className="bg-slate-800" value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option className="bg-slate-800" value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Weight Unit</label>
            <select name="weightUnit" className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors" value={preferences.weightUnit} onChange={handleChange}>
              <option className="bg-slate-800" value="kg">Kilograms (kg)</option>
              <option className="bg-slate-800" value="lbs">Pounds (lbs)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Currency</label>
            <select name="currency" className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors" value={preferences.currency} onChange={handleChange}>
              <option className="bg-slate-800" value="INR">INR (₹)</option>
              <option className="bg-slate-800" value="USD">USD ($)</option>
              <option className="bg-slate-800" value="EUR">EUR (€)</option>
              <option className="bg-slate-800" value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Theme</label>
            <select name="theme" className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors" value={preferences.theme} onChange={handleChange}>
              <option className="bg-slate-800" value="dark">Dark Theme</option>
              <option className="bg-slate-800" value="light">Light Theme</option>
              <option className="bg-slate-800" value="system">System Default</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Dashboard Refresh (Minutes)</label>
            <input 
              name="dashboardRefreshMinutes"
              type="number" 
              className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors"
              value={preferences.dashboardRefreshMinutes} 
              onChange={handleChange}
              min={1}
              max={60}
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4 pt-6 border-t border-white/10">Dashboard Widgets</h3>
        
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer text-sm">
            <input 
              type="checkbox" 
              name="showWeatherWidget"
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
              checked={preferences.showWeatherWidget}
              onChange={handleChange}
            />
            Show Weather Widget
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer text-sm">
            <input 
              type="checkbox" 
              name="showAiBriefing"
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
              checked={preferences.showAiBriefing}
              onChange={handleChange}
            />
            Show AI Briefing
          </label>
        </div>

        <button 
          className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 mt-8" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};
