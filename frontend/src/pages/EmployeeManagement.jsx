import { format, startOfMonth } from "date-fns";
import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { createPortal } from "react-dom";
import { toastConfig } from "../utils/toastConfig";
import { Calendar, Download, Upload, FileDown, Plus } from "lucide-react";
import { fetchEmployees, fetchSales } from "../services/api";
import api from "../services/api";
import DateFilter from "../components/forms/DateFilter";
import { getDateRange, filterDataByDate } from "../utils/dateUtils";
import { exportToExcel, downloadTemplate, importFromExcel } from "../utils/excelUtils";

const EXECUTIVE_HEADERS = [
  { key: "name", label: "Full Name" },
  { key: "position", label: "Designation / Position" },
  { key: "salary", label: "Base Salary" },
  { key: "phone", label: "Mobile Number" },
  { key: "area", label: "Area / Region" },
];

const EXECUTIVE_HEADERS_MAP = {
  name: "Full Name",
  position: "Designation / Position",
  salary: "Base Salary",
  phone: "Mobile Number",
  area: "Area / Region",
};

import ExecutivesStats from "../components/sales-executives/ExecutivesStats";
import ExecutivesTable from "../components/sales-executives/ExecutivesTable";
import ExecutiveInsights from "../components/sales-executives/ExecutiveInsights";
import ExecutiveProfilePanel from "../components/sales-executives/ExecutiveProfilePanel";
import { SkeletonPageFallback } from "../components/common/Skeleton";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    range: "month",
    isCustom: false,
    isDirty: false,
    pickerOpen: false,
    customRange: {
      startDate: startOfMonth(new Date()),
      endDate: new Date()
    }
  });

  // Form states
  const [name, setName] = useState("");
  const [position, setPosition] = useState("Sales Executive");
  const [salary, setSalary] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");

  const handleExportExcel = () => {
    if (employees.length === 0) {
      toast.info("No sales executives data to export.");
      return;
    }
    exportToExcel(employees, EXECUTIVE_HEADERS, "sales_executives_list");
    toast.success("Sales executives list exported to Excel!");
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(EXECUTIVE_HEADERS, "sales_executives");
    toast.info("Excel template downloaded!");
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading("Parsing Excel file...");
    try {
      const rawRows = await importFromExcel(file, EXECUTIVE_HEADERS_MAP);
      toast.update(loadingToast, { render: `Found ${rawRows.length} rows. Registering executives...`, type: "info", isLoading: true });

      let successCount = 0;
      let failCount = 0;

      for (const row of rawRows) {
        if (!row.name || !row.salary) {
          failCount++;
          continue;
        }
        try {
          await api.post("/employees", {
            name: String(row.name).trim(),
            position: String(row.position || "Sales Executive").trim(),
            salary: parseFloat(row.salary),
            phone: String(row.phone || "").trim(),
            area: String(row.area || "").trim(),
            date: new Date().toISOString()
          });
          successCount++;
        } catch (err) {
          console.error("Failed to import executive:", row, err);
          failCount++;
        }
      }

      loadData();
      if (failCount === 0) {
        toast.update(loadingToast, { render: `Successfully registered ${successCount} sales executives!`, type: "success", isLoading: false, autoClose: 2500 });
      } else {
        toast.update(loadingToast, { render: `Registered ${successCount} executives. Failed to register ${failCount} rows.`, type: "warning", isLoading: false, autoClose: 3500 });
      }
    } catch (err) {
      console.error("Excel import error:", err);
      toast.update(loadingToast, { render: `Import failed: ${err.message || "Invalid file format"}`, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      e.target.value = ""; // Clear file input
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [empData, salesData] = await Promise.all([
        fetchEmployees(),
        fetchSales()
      ]);
      setEmployees(empData);
      setSales(salesData);
      if (empData.length > 0 && !selectedExecutive) {
        setSelectedExecutive(empData[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedExecutive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !salary || !phone || !area) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, {
          name,
          position,
          salary: parseFloat(salary),
          phone,
          area,
          date: editingEmployee.dateAdded
        });
        toast.success("Sales Executive details updated successfully!");
      } else {
        await api.post("/employees", {
          name,
          position,
          salary: parseFloat(salary),
          phone,
          area,
          date: new Date().toISOString()
        });
        toast.success("New Sales Executive registered successfully!");
      }
      
      setShowModal(false);
      setName("");
      setSalary("");
      setPhone("");
      setArea("");
      setEditingEmployee(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(editingEmployee ? "Failed to update executive." : "Failed to add executive.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      toast.warning("Executive deleted from system.");
      if (selectedExecutive?.id === id) setSelectedExecutive(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <SkeletonPageFallback />;

  const activeDateRange = dateFilter.isCustom ? dateFilter.customRange : getDateRange(dateFilter.range);
  const filteredEmployees = filterDataByDate(employees, activeDateRange, "dateAdded");
  const filteredSales = filterDataByDate(sales, activeDateRange, "date");

  return (
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 page-bg animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Sales Executives</h1>
            <p className="text-gray-500 text-sm">Manage and track your sales team performance.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
            <button 
              onClick={handleDownloadTemplate}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition shadow-md"
              title="Download Excel Template"
            >
              <FileDown className="w-4 h-4 mr-1 text-purple-500" /> Template
            </button>
            <label className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition cursor-pointer shadow-md">
              <Upload className="w-4 h-4 mr-1 text-purple-500" /> Import
              <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
            </label>
            <button 
              onClick={handleExportExcel}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition shadow-md"
              title="Export to Excel"
            >
              <Download className="w-4 h-4 mr-1 text-purple-500" /> Export
            </button>
            <button 
              onClick={() => {
                setEditingEmployee(null);
                setName("");
                setPosition("Sales Executive");
                setSalary("");
                setPhone("");
                setArea("");
                setShowModal(true);
              }}
              className="bg-emerald-600 text-gray-900 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Executive
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <ExecutivesStats employees={filteredEmployees} sales={filteredSales} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          {/* Left Column */}
          <div className="col-span-1 xl:col-span-9 flex flex-col">
            <ExecutivesTable 
              employees={filteredEmployees} 
              sales={filteredSales} 
              onSelect={setSelectedExecutive} 
              onEdit={(emp) => {
                setEditingEmployee(emp);
                setName(emp.name);
                setPosition(emp.position);
                setSalary(emp.salary);
                setPhone(emp.phone);
                setArea(emp.area);
                setShowModal(true);
              }}
              onDelete={handleDelete}
            />
            <ExecutiveInsights sales={filteredSales} employees={filteredEmployees} />
          </div>

          {/* Right Column */}
          <div className="col-span-1 xl:col-span-3 flex flex-col">
            <ExecutiveProfilePanel executive={selectedExecutive} sales={filteredSales} />
          </div>
        </div>

      </main>

      {/* Add/Edit Executive Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="glass-modal relative w-full max-w-md p-5 max-h-[90vh] overflow-y-auto no-scrollbar animate-modalSlideIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingEmployee ? "Edit Sales Executive" : "Register Sales Executive"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-500 mb-1 text-xs">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Vikram Yadav" 
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 text-xs">Designation / Position</label>
                <input 
                  type="text" 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)} 
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 text-xs">Base Salary (₹)</label>
                <input 
                  type="number" 
                  value={salary} 
                  onChange={(e) => setSalary(e.target.value)} 
                  placeholder="e.g. 18000"
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 text-xs">Mobile Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="e.g. 9876543210"
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 text-xs">Area / Region</label>
                <input 
                  type="text" 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)} 
                  placeholder="e.g. Hyderabad"
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-gray-900 rounded hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
                >
                  {editingEmployee ? "Save Changes" : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default EmployeeManagement;



