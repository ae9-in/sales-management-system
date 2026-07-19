import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AppSettingsForm = () => {
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [defaultDash, setDefaultDash] = useState('Daily Sales');
  const [defaultSalesView, setDefaultSalesView] = useState('My Sales');
  const [confirmDelete, setConfirmDelete] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("settings_app");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItemsPerPage(parsed.itemsPerPage || '10');
        setDefaultDash(parsed.defaultDash || 'Daily Sales');
        setDefaultSalesView(parsed.defaultSalesView || 'My Sales');
        setConfirmDelete(parsed.confirmDelete !== undefined ? parsed.confirmDelete : true);
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("settings_app", JSON.stringify({ itemsPerPage, defaultDash, defaultSalesView, confirmDelete }));
    toast.success("Application preferences saved successfully!");
  };

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl">
      <h3 className="font-semibold text-gray-100 mb-4 text-sm">Application Preferences</h3>
      
      <div className="space-y-4 text-xs">
        <div>
          <label className="text-[10px] text-gray-400 mb-1.5 block">Items per page</label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2.5 py-1.5 text-gray-300 outline-none"
          >
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 mb-1.5 block">Default Dashboard</label>
          <select 
            value={defaultDash} 
            onChange={(e) => setDefaultDash(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2.5 py-1.5 text-gray-300 outline-none"
          >
            <option>Daily Sales</option>
            <option>Sales History</option>
            <option>Reports</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 mb-1.5 block">Default Sales View</label>
          <select 
            value={defaultSalesView} 
            onChange={(e) => setDefaultSalesView(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2.5 py-1.5 text-gray-300 outline-none"
          >
            <option>My Sales</option>
            <option>All Sales</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer py-1 select-none">
          <input 
            type="checkbox" 
            checked={confirmDelete}
            onChange={() => setConfirmDelete(!confirmDelete)}
            className="w-3.5 h-3.5 bg-gray-700 border-gray-600 rounded accent-blue-600 outline-none"
          />
          <span className="text-[10px] text-gray-400">Confirm before deleting records</span>
        </label>

        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-xs transition shadow-lg shadow-blue-500/20 mt-2"
        >
            Save Preferences
        </button>

      </div>
    </div>
  );
};

export default AppSettingsForm;
