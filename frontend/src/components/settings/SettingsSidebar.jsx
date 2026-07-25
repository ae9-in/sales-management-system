import React from 'react';
import { Settings, User, Building, Users, Shield, Bell, DollarSign, CreditCard, RotateCcw, Share2, ListCollapse } from 'lucide-react';

const SettingsSidebar = ({ activeMenu, setActiveMenu }) => {
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedInUser.role === "admin";

  const menuItems = [
    { icon: Settings, label: 'General' },
    { icon: Building, label: 'Company' },
    { icon: Shield, label: 'Security' },
    { icon: Bell, label: 'System Preferences' },
    ...(isAdmin ? [{ icon: Users, label: 'User Management' }] : [])
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 w-full flex flex-col gap-1">
      {menuItems.map((item, i) => (
        <button
          key={i}
          onClick={() => setActiveMenu(item.label)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition w-full text-left ${
            activeMenu === item.label
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 border border-transparent'
          }`}
        >
          <item.icon size={16} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SettingsSidebar;
