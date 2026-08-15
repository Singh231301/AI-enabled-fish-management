import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export const DataManagementTab: React.FC = () => {
  const [modules, setModules] = useState({
    profile: true,
    ponds: true,
    fish: true,
    feeding: true,
    tasks: false,
    inventory: false,
    waterQuality: true,
    alerts: false,
  });
  const [format, setFormat] = useState('JSON');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleToggleModule = (module: keyof typeof modules) => {
    setModules(prev => ({ ...prev, [module]: !prev[module] }));
  };

  const handleExport = () => {
    toast.success(`Exporting selected data in ${format} format...`);
  };

  const handleDeleteAccount = () => {
    if (deleteInput === 'DELETE MY ACCOUNT') {
      toast.success('Account deletion initiated.');
      setShowDeleteConfirm(false);
      setDeleteInput('');
    } else {
      toast.error('Please type DELETE MY ACCOUNT to confirm.');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-200">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4">Data Export</h3>
        <p className="text-sm text-slate-400 mb-6">
          Select the data modules you wish to export. The export process will compile your data into a downloadable file.
        </p>
        
        {/* 2x4 grid of smaller toggle buttons on mobile, or 4x2 on desktop depending on grid col */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(Object.keys(modules) as Array<keyof typeof modules>).map(module => (
            <button 
              key={module}
              onClick={() => handleToggleModule(module)}
              className={`text-xs md:text-sm py-2 px-3 rounded-lg border transition-all ${
                modules[module] 
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              {module.charAt(0).toUpperCase() + module.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 mb-6 max-w-[200px]">
          <label className="text-sm font-semibold">Export Format</label>
          <select 
            className="bg-white/5 border border-white/10 text-white p-3 rounded-lg outline-none text-sm w-full focus:border-blue-500 transition-colors" 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
          >
            <option className="bg-slate-800" value="JSON">JSON (.json)</option>
            <option className="bg-slate-800" value="CSV">CSV (.csv)</option>
          </select>
        </div>

        <button 
          className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition"
          onClick={handleExport}
        >
          Export Data
        </button>
      </div>

      <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-400 mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>

        {!showDeleteConfirm ? (
          <button 
            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-black/20 p-4 rounded-xl border border-dashed border-red-500/50">
            <p className="text-sm mb-4">
              Type <strong className="text-red-400">DELETE MY ACCOUNT</strong> below to confirm.
            </p>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <input 
                className="bg-white/5 border border-red-500/50 text-white p-4 rounded-xl outline-none text-lg font-mono tracking-wider focus:border-red-500 w-full md:flex-1" 
                type="text" 
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
              />
              <div className="flex flex-col md:flex-row gap-3">
                <button 
                  className="bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 text-lg w-full md:w-auto" 
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE MY ACCOUNT'}
                >
                  Confirm Deletion
                </button>
                <button 
                  className="bg-transparent border border-white/20 text-white px-6 py-4 rounded-xl font-semibold hover:bg-white/5 transition text-lg w-full md:w-auto" 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
