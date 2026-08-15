import React, { useState } from 'react';
import { Plus, Trash2, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Invitation {
  id: string;
  email: string;
  role: string;
  pond: string;
  status: string;
}

export const UserManagementTab: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [pond, setPond] = useState('All Ponds');
  const [invitations, setInvitations] = useState<Invitation[]>([
    { id: '1', email: 'worker@fishfarm.com', role: 'HELPER', pond: 'Pond A', status: 'Pending' },
    { id: '2', email: 'manager@fishfarm.com', role: 'ADMIN', pond: 'All Ponds', status: 'Pending' },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    const newInv: Invitation = {
      id: Date.now().toString(),
      email,
      role,
      pond,
      status: 'Pending'
    };
    
    setInvitations([...invitations, newInv]);
    setEmail('');
    toast.success(`Invitation sent to ${email}`);
  };

  const handleRevoke = (id: string) => {
    setInvitations(invitations.filter(inv => inv.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 text-slate-200">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-6">Invite New User</h3>
        
        <form onSubmit={handleInvite} className="flex flex-col lg:flex-row gap-4 items-start lg:items-end flex-wrap mb-4">
          <div className="flex flex-col gap-2 w-full lg:flex-1 lg:min-w-[200px]">
            <label className="text-sm font-semibold text-slate-300">Email Address</label>
            <input 
              className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2 w-full lg:flex-1 lg:min-w-[200px]">
            <label className="text-sm font-semibold text-slate-300">Role</label>
            <select className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors" value={role} onChange={(e) => setRole(e.target.value)}>
              <option className="bg-slate-800" value="VIEWER">VIEWER (Read Only)</option>
              <option className="bg-slate-800" value="HELPER">HELPER (Logs Tasks)</option>
              <option className="bg-slate-800" value="ADMIN">ADMIN (Full Access)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 w-full lg:flex-1 lg:min-w-[200px]">
            <label className="text-sm font-semibold text-slate-300">Assigned Pond (Optional)</label>
            <select className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors" value={pond} onChange={(e) => setPond(e.target.value)}>
              <option className="bg-slate-800" value="All Ponds">All Ponds</option>
              <option className="bg-slate-800" value="Pond A">Pond A</option>
              <option className="bg-slate-800" value="Pond B">Pond B</option>
              <option className="bg-slate-800" value="Nursery">Nursery</option>
            </select>
          </div>

          <button type="submit" className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition h-[46px] w-full lg:w-auto mt-2 lg:mt-0">
            Send Invite
          </button>
        </form>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-6">Pending Invitations</h3>
        
        {invitations.length === 0 ? (
          <p className="text-slate-400 text-sm">No pending invitations.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b border-white/10 text-slate-400 font-semibold text-sm">Email</th>
                    <th className="text-left p-3 border-b border-white/10 text-slate-400 font-semibold text-sm">Role</th>
                    <th className="text-left p-3 border-b border-white/10 text-slate-400 font-semibold text-sm">Assigned Pond</th>
                    <th className="text-left p-3 border-b border-white/10 text-slate-400 font-semibold text-sm">Status</th>
                    <th className="text-left p-3 border-b border-white/10 text-slate-400 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id}>
                      <td className="p-3 border-b border-white/5 text-sm">{inv.email}</td>
                      <td className="p-3 border-b border-white/5 text-sm">
                        <span className="px-2 py-1 rounded bg-white/10 text-xs">
                          {inv.role}
                        </span>
                      </td>
                      <td className="p-3 border-b border-white/5 text-sm">{inv.pond}</td>
                      <td className="p-3 border-b border-white/5 text-sm">
                        <span className="text-yellow-400">{inv.status}</span>
                      </td>
                      <td className="p-3 border-b border-white/5 text-sm">
                        <button 
                          onClick={() => handleRevoke(inv.id)}
                          className="bg-transparent border border-red-500/50 text-red-400 px-3 py-1 rounded text-xs hover:bg-red-500/10 transition"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="flex flex-col gap-4 md:hidden">
              {invitations.map((inv) => (
                <div key={inv.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate mr-2" title={inv.email}>{inv.email}</div>
                    <span className="text-yellow-400 text-xs shrink-0">{inv.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span className="px-2 py-1 rounded bg-white/10 text-xs text-white">
                      {inv.role}
                    </span>
                    <span>{inv.pond}</span>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-white/10 mt-1">
                    <button 
                      onClick={() => handleRevoke(inv.id)}
                      className="bg-transparent border border-red-500/50 text-red-400 px-4 py-1.5 rounded text-xs hover:bg-red-500/10 transition w-full"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
