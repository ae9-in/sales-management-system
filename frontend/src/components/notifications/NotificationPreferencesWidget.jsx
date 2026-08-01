import React, { useState } from 'react';
import { Mail, Bell, Volume2, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const NotificationPreferencesWidget = () => {
  const [emailOn, setEmailOn] = useState(true);
  const [browserOn, setBrowserOn] = useState(true);
  const [soundOn, setSoundOn] = useState(false);

  const toggleEmail = () => {
    setEmailOn(!emailOn);
    toast.info(`Email notifications turned ${!emailOn ? 'On' : 'Off'}`);
  };

  const toggleBrowser = () => {
    setBrowserOn(!browserOn);
    toast.info(`Browser alerts turned ${!browserOn ? 'On' : 'Off'}`);
  };

  const toggleSound = () => {
    setSoundOn(!soundOn);
    toast.info(`Sound alerts turned ${!soundOn ? 'On' : 'Off'}`);
  };

  return (
    <div className="glass-card-elevated p-5">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Notification Preferences</h3>
      <div className="space-y-4 mb-4">
        
        <div 
          onClick={toggleEmail} 
          className="flex justify-between items-center text-xs cursor-pointer hover:bg-gray-100/20 p-1 rounded transition"
        >
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-gray-500" />
            <span className="text-gray-600 font-medium">Email Notifications</span>
          </div>
          <span className={`font-semibold ${emailOn ? 'text-green-400' : 'text-gray-500'}`}>{emailOn ? 'On' : 'Off'}</span>
        </div>

        <div 
          onClick={toggleBrowser} 
          className="flex justify-between items-center text-xs cursor-pointer hover:bg-gray-100/20 p-1 rounded transition"
        >
          <div className="flex items-center gap-3">
            <Bell size={16} className="text-gray-500" />
            <span className="text-gray-600 font-medium">Browser Notifications</span>
          </div>
          <span className={`font-semibold ${browserOn ? 'text-green-400' : 'text-gray-500'}`}>{browserOn ? 'On' : 'Off'}</span>
        </div>

        <div 
          onClick={toggleSound} 
          className="flex justify-between items-center text-xs cursor-pointer hover:bg-gray-100/20 p-1 rounded transition"
        >
          <div className="flex items-center gap-3">
            <Volume2 size={16} className="text-gray-500" />
            <span className="text-gray-600 font-medium">Sound Alerts</span>
          </div>
          <span className={`font-semibold ${soundOn ? 'text-green-400' : 'text-gray-500'}`}>{soundOn ? 'On' : 'Off'}</span>
        </div>

      </div>
      
      <button 
        onClick={() => toast.success("Notification configurations saved successfully!")}
        className="w-full flex items-center justify-between border border-gray-200 bg-transparent text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-xs hover:bg-gray-100/50 transition"
      >
        <span>Save Preferences</span>
        <ChevronRight size={14} className="text-gray-500" />
      </button>
    </div>
  );
};

export default NotificationPreferencesWidget;






