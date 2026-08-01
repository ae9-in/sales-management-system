import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Sliders, Moon } from 'lucide-react';
import { toast } from 'react-toastify';

const ToggleSwitch = ({ label, description, checked, onChange, icon: Icon, colorClass }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200/50 last:border-b-0">
    <div className="flex gap-4 items-start">
        <div className={`p-2 rounded-lg ${colorClass} mt-0.5`}>
            <Icon size={16} />
        </div>
        <div>
            <h4 className="text-xs font-semibold text-gray-200">{label}</h4>
            <p className="text-[10px] text-gray-500">{description}</p>
        </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
    </label>
  </div>
);

const SystemPreferencesForm = () => {
  const [prefs, setPrefs] = useState({
    reminders: true,
    email: true,
    browser: true,
    darkMode: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("settings_preferences");
    if (saved) {
      try {
        setPrefs(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleToggle = (key) => {
    const nextPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(nextPrefs);
    localStorage.setItem("settings_preferences", JSON.stringify(nextPrefs));
    toast.success(`Option updated: ${key} is now ${!prefs[key] ? 'Enabled' : 'Disabled'}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-200 mb-4 border-b border-gray-200 pb-3">System Preferences</h3>
      <div className="space-y-1">
        <ToggleSwitch
          label="Enable Daily Sales Reminders"
          description="Receive daily reminders to update your sales."
          checked={prefs.reminders}
          onChange={() => handleToggle('reminders')}
          icon={Sliders}
          colorClass="bg-emerald-500/10 text-emerald-600"
        />
        <ToggleSwitch
          label="Email Notifications"
          description="Receive email notifications for important updates."
          checked={prefs.email}
          onChange={() => handleToggle('email')}
          icon={Bell}
          colorClass="bg-green-500/10 text-green-400"
        />
        <ToggleSwitch
          label="Browser Notifications"
          description="Show desktop notifications for alerts and updates."
          checked={prefs.browser}
          onChange={() => handleToggle('browser')}
          icon={ShieldAlert}
          colorClass="bg-indigo-500/10 text-indigo-400"
        />
        <ToggleSwitch
          label="Dark Theme Layout"
          description="Enable dark mode layout across all pages."
          checked={prefs.darkMode}
          onChange={() => handleToggle('darkMode')}
          icon={Moon}
          colorClass="bg-purple-500/10 text-purple-400"
        />
      </div>
    </div>
  );
};

export default SystemPreferencesForm;


