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
    <div className="bg-white border border-gray-200 rounded-xl p-4 w-full flex flex-col gap-1">
      {menuItems.map((item, i) => (
        <button
          key={i}
          onClick={() => setActiveMenu(item.label)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition w-full text-left ${
            activeMenu === item.label
              ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-500/20'
              : 'text-gray-500 hover:text-gray-200 hover:bg-gray-100/50 border border-transparent'
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


