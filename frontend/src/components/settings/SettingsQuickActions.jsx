import React from 'react';
import { Key, Users, UserCog, CloudLightning, FileDown, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

import { exportBackupData, importBackupData } from '../../services/api';

const SettingsQuickActions = ({ onNavigate }) => {
  const handleAction = async (title) => {
    if (title === 'Change Password') {
      onNavigate('Security');
      toast.info("Navigated to Security settings.");
    } else if (title === 'Backup Data') {
      try {
        toast.info("Exporting database backup...");
        const data = await exportBackupData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `salestrack_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Backup downloaded successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to download backup.");
      }
    } else if (title === 'Import Data') {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (!data.sales || !data.employees || !data.inventory) {
              toast.error("Invalid backup file. Must contain sales, employees and inventory.");
              return;
            }
            toast.info("Restoring database backup...");
            const res = await importBackupData(data);
            toast.success(`Restore successful! Restored ${res.counts.sales} sales, ${res.counts.employees} employees, and ${res.counts.inventory} inventory items.`);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (err) {
            console.error(err);
            toast.error("Failed to import backup: invalid file content.");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    } else {
      toast.info(`Triggered action: ${title}`);
    }
  };

  const actions = [
    { icon: Key, title: 'Change Password', subtext: 'Update your account password', color: 'text-emerald-600 bg-emerald-500/10' },
    { icon: CloudLightning, title: 'Backup Data', subtext: 'Download database backups', color: 'text-emerald-600 bg-emerald-500/10' },
    { icon: FileDown, title: 'Import Data', subtext: 'Restore JSON backup', color: 'text-orange-400 bg-orange-500/10' },
  ];

  return (
    <div className="glass-card-elevated p-5 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((act, i) => (
          <div 
            key={i} 
            onClick={() => handleAction(act.title)}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100/50 cursor-pointer border border-transparent hover:border-gray-200 transition"
          >
              <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${act.color}`}>
                      <act.icon className="w-4 h-4" />
                  </div>
                  <div>
                      <h4 className="text-xs font-semibold text-gray-800">{act.title}</h4>
                      <p className="text-[9px] text-gray-500">{act.subtext}</p>
                  </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsQuickActions;






