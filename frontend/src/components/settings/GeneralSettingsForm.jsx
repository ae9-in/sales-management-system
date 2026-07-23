import React, { useState, useEffect } from 'react';
import { Globe, Calendar, Clock, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

const GeneralSettingsForm = () => {
  const [lang, setLang] = useState('English (US)');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
  const [timezone, setTimezone] = useState('(GMT +05:30) Asia/Kolkata');
  const [currency, setCurrency] = useState('INR (₹) - Indian Rupee');

  useEffect(() => {
    const saved = localStorage.getItem("settings_general");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLang(parsed.lang || 'English (US)');
        setDateFormat(parsed.dateFormat || 'DD MMM YYYY');
        setTimezone(parsed.timezone || '(GMT +05:30) Asia/Kolkata');
        setCurrency(parsed.currency || 'INR (₹) - Indian Rupee');
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("settings_general", JSON.stringify({ lang, dateFormat, timezone, currency }));
    toast.success("General configurations updated successfully!");
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-200 mb-6 border-b border-gray-700 pb-3">General Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-2">
            <Globe size={14} /> Language
          </label>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="w-full bg-gray-700 text-sm text-gray-200 border border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
            <option>English (US)</option>
            <option>Hindi</option>
            <option>Kannada</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-2">
            <Calendar size={14} /> Date Format
          </label>
          <select 
            value={dateFormat} 
            onChange={(e) => setDateFormat(e.target.value)}
            className="w-full bg-gray-700 text-sm text-gray-200 border border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
            <option>DD MMM YYYY</option>
            <option>YYYY-MM-DD</option>
            <option>DD/MM/YYYY</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-2">
            <Clock size={14} /> Time Zone
          </label>
          <select 
            value={timezone} 
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full bg-gray-700 text-sm text-gray-200 border border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
            <option>(GMT +05:30) Asia/Kolkata</option>
            <option>(GMT +00:00) UTC</option>
            <option>(GMT -05:00) EST</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-2">
            <DollarSign size={14} /> Currency
          </label>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-gray-700 text-sm text-gray-200 border border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
            <option>INR (₹) - Indian Rupee</option>
            <option>USD ($) - US Dollar</option>
            <option>EUR (€) - Euro</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-700 pt-4">
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-lg shadow-blue-500/20"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default GeneralSettingsForm;
