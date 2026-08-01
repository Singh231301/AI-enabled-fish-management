import React, { useState } from 'react';
import { ProfileTab } from '../../components/settings/ProfileTab';
import { NotificationSettingsTab } from '../../components/settings/NotificationSettingsTab';
import { AppPreferencesTab } from '../../components/settings/AppPreferencesTab';
import { FeedingScheduleTab } from '../../components/settings/FeedingScheduleTab';
import { UserManagementTab } from '../../components/settings/UserManagementTab';
import { DataManagementTab } from '../../components/settings/DataManagementTab';
import { User, Bell, Settings, Calendar, Users, Database } from 'lucide-react';

type TabType = 'Profile' | 'Notifications' | 'Preferences' | 'Feeding' | 'Users' | 'Data';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Profile');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'Profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'Notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'Preferences', label: 'Preferences', icon: <Settings size={20} /> },
    { id: 'Feeding', label: 'Feeding', icon: <Calendar size={20} /> },
    { id: 'Users', label: 'Users', icon: <Users size={20} /> },
    { id: 'Data', label: 'Data', icon: <Database size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile': return <ProfileTab />;
      case 'Notifications': return <NotificationSettingsTab />;
      case 'Preferences': return <AppPreferencesTab />;
      case 'Feeding': return <FeedingScheduleTab />;
      case 'Users': return <UserManagementTab />;
      case 'Data': return <DataManagementTab />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-50 p-4 md:p-6 gap-6 md:gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex flex-col shrink-0">
        <h2 className="text-2xl font-bold mb-4 md:mb-6 hidden md:block">Settings</h2>
        
        {/* Mobile: Horizontal scroll, Icons only. Desktop: Vertical list, Text + Icons */}
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`
                  flex items-center justify-center md:justify-start gap-3 
                  p-3 md:px-4 md:py-3 rounded-lg cursor-pointer transition-all shrink-0
                  w-10 h-10 md:w-full md:h-auto
                  ${isActive 
                    ? 'bg-white/10 border-white/20 text-white font-semibold' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 font-normal'}
                  border
                `}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-4xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;
