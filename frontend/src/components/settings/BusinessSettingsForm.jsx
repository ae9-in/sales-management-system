import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

const BusinessSettingsForm = () => {
  const [formData, setFormData] = useState({
    businessName: 'SalesTrack Solutions Pvt. Ltd.',
    businessEmail: 'contact@salestrack.com',
    businessPhone: '+91 98765 43210',
    businessAddress: '2nd Floor, Skyline Towers, Church Street, Bangalore, Karnataka - 560001, India'
  });

  useEffect(() => {
    const saved = localStorage.getItem("settings_business");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem("settings_business", JSON.stringify(formData));
    window.dispatchEvent(new Event("business_settings_updated"));
    toast.success("Business information updated successfully!");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-200 mb-6 border-b border-gray-200 pb-3">Business Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-2">
            <Building2 size={14} /> Business Name
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="w-full bg-gray-100 text-sm text-gray-200 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-2">
            <Mail size={14} /> Business Email
          </label>
          <input
            type="email"
            name="businessEmail"
            value={formData.businessEmail}
            onChange={handleChange}
            className="w-full bg-gray-100 text-sm text-gray-200 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-2">
            <Phone size={14} /> Business Phone
          </label>
          <input
            type="text"
            name="businessPhone"
            value={formData.businessPhone}
            onChange={handleChange}
            className="w-full bg-gray-100 text-sm text-gray-200 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-2">
            <MapPin size={14} /> Business Address
          </label>
          <textarea
            name="businessAddress"
            rows="2"
            value={formData.businessAddress}
            onChange={handleChange}
            className="w-full bg-gray-100 text-sm text-gray-200 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-4">
        <button 
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-gray-900 text-xs font-semibold px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-500/20"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default BusinessSettingsForm;


