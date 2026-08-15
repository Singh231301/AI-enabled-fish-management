import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

type NotificationType = 'taskDue' | 'aiAlert' | 'lowStock' | 'systemUpdate';
type Priority = 'low' | 'medium' | 'high';

interface NotificationSetting {
  inApp: boolean;
  email: boolean;
  priority: Priority;
}

type NotificationState = Record<NotificationType, NotificationSetting>;

export const NotificationSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<NotificationState>({
    taskDue: { inApp: true, email: false, priority: 'medium' },
    aiAlert: { inApp: true, email: true, priority: 'high' },
    lowStock: { inApp: true, email: true, priority: 'high' },
    systemUpdate: { inApp: true, email: false, priority: 'low' },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch settings on mount
  }, []);

  const handleToggle = (type: NotificationType, channel: keyof NotificationSetting) => {
    if (channel === 'priority') return;
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type][channel]
      }
    }));
  };
  
  const handlePriorityChange = (type: NotificationType, priority: Priority) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        priority
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      toast.success('Notification preferences saved.');
    } catch (error) {
      toast.error('Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  const notificationLabels: Record<NotificationType, string> = {
    taskDue: 'Task Due',
    aiAlert: 'AI Alerts (Anomalies)',
    lowStock: 'Low Stock Warnings',
    systemUpdate: 'System Updates'
  };

  return (
    <div className="flex flex-col gap-6 text-slate-200">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
        <p className="text-sm text-slate-400 mb-6">
          Choose how you want to be notified for different events.
        </p>

        <div className="flex flex-col border-t border-white/10">
          {(Object.keys(settings) as NotificationType[]).map((type) => (
            <div key={type} className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-white/10 gap-4">
              <div className="font-semibold text-sm w-full md:w-auto">
                {notificationLabels[type]}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                {/* Priority Select - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-2">
                  <label className="text-xs text-slate-400">Priority:</label>
                  <select 
                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-sm outline-none"
                    value={settings[type].priority}
                    onChange={(e) => handlePriorityChange(type, e.target.value as Priority)}
                  >
                    <option className="bg-slate-800" value="low">Low</option>
                    <option className="bg-slate-800" value="medium">Medium</option>
                    <option className="bg-slate-800" value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                      checked={settings[type].inApp}
                      onChange={() => handleToggle(type, 'inApp')}
                    />
                    In-App
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                      checked={settings[type].email}
                      onChange={() => handleToggle(type, 'email')}
                    />
                    Email
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 mt-6" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};
