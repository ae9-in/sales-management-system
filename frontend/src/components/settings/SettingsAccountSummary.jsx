import React from 'react';
import { LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SettingsAccountSummary = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl mb-6 font-sans">
      <h3 className="font-semibold text-gray-100 mb-4 text-sm">Account Summary</h3>
      
      <div className="space-y-3 text-xs mb-6">
        <div className="flex justify-between items-center">
            <span className="text-gray-400">Your Role</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 font-semibold">Super Admin</span>
        </div>
        <div className="flex justify-between">
            <span className="text-gray-400">Username</span>
            <span className="font-medium text-gray-200">admin</span>
        </div>
        <div className="flex justify-between">
            <span className="text-gray-400">Member Since</span>
            <span className="font-medium text-gray-200">15 Jan 2024</span>
        </div>
        <div className="flex justify-between">
            <span className="text-gray-400">Last Login</span>
            <span className="font-medium text-gray-200">{format(new Date(), "dd MMM yyyy, hh:mm a")}</span>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 border border-red-500/50 hover:border-red-500 bg-transparent text-red-400 hover:text-white py-2 rounded-lg text-xs font-semibold transition hover:bg-red-500/10 cursor-pointer"
      >
          <LogOut size={14} /> Logout
      </button>
    </div>
  );
};

export default SettingsAccountSummary;
