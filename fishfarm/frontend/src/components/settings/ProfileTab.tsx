import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.name || '');
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    try {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-200">
      {message.text && (
        <div className={`p-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section - Stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-slate-600">
              <User size={48} className="text-slate-400" />
            </div>
            <button className="text-sm bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg text-slate-200">
              Change Avatar
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Full Name</label>
              <input 
                className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors"
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Email Address</label>
              <input 
                className="bg-white/5 border border-white/10 text-white/50 p-3 rounded-lg outline-none text-sm w-full"
                type="email" 
                value={user?.email || ''}
                disabled
              />
              <span className="text-xs text-slate-400">Email cannot be changed</span>
            </div>
            <div>
              <button type="submit" className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 mt-2" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Change Password</h3>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Current Password</label>
            <input 
              className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm focus:border-blue-500 transition-colors"
              type="password" 
              value={password.current}
              onChange={(e) => setPassword({ ...password, current: e.target.value })}
              placeholder="Enter current password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">New Password</label>
            <input 
              className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm focus:border-blue-500 transition-colors"
              type="password" 
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
              placeholder="Enter new password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Confirm New Password</label>
            <input 
              className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm focus:border-blue-500 transition-colors"
              type="password" 
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>
          <div>
            <button type="submit" className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 mt-2" disabled={loading}>
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
