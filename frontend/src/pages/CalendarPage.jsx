import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { fetchSales, fetchEmployees, fetchInventory } from "../services/api";
import api from "../services/api";
import { parseISO, format, startOfMonth } from "date-fns";
import DateFilter from "../components/forms/DateFilter";
import { getDateRange, filterDataByDate } from "../utils/dateUtils";

import MainCalendarGrid from "../components/calendar/MainCalendarGrid";
import MiniCalendarWidget from "../components/calendar/MiniCalendarWidget";
import ActivityTypesWidget from "../components/calendar/ActivityTypesWidget";
import TodaysAgendaWidget from "../components/calendar/TodaysAgendaWidget";
import { SkeletonPageFallback } from "../components/common/Skeleton";

const CalendarPage = () => {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(19); // Today is 19th July 2026
  const [calendarView, setCalendarView] = useState("month");
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

  const handlePrevDay = () => {
    setSelectedDay(prev => Math.max(1, prev - 1));
  };
  const handleNextDay = () => {
    setSelectedDay(prev => Math.min(31, prev + 1));
  };
  const handleToday = () => {
    setSelectedDay(19);
  };

  // Form states
  const [customer, setCustomer] = useState("");
  const [rep, setRep] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [salesData, employeesData, inventoryData] = await Promise.all([
        fetchSales(),
        fetchEmployees(),
        fetchInventory()
      ]);
      setSales(salesData);
      setEmployees(employeesData);
      setInventory(inventoryData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!customer || !product || !quantity || !price) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const total = parseFloat(quantity) * parseFloat(price);
      await api.post("/sales", {
        customer,
        rep: rep || (employees[0]?.name || "Arjun Kumar"),
        product,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        total,
        status: "Pending",
        method: "UPI",
        date: new Date(`${date}T10:00:00`).toISOString()
      });

      toast.success("Activity scheduled on calendar successfully!");
      setShowModal(false);
      
      setCustomer("");
      setQuantity("");
      setPrice("");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add activity.");
    }
  };

  if (loading) return <SkeletonPageFallback />;

  const activeDateRange = dateFilter.isCustom ? dateFilter.customRange : getDateRange(dateFilter.range);
  const filteredSales = filterDataByDate(sales, activeDateRange, "date");

  // Map database sales as calendar events
  const calendarEvents = filteredSales.map(s => {
    let dayNum = 15;
    try {
      dayNum = parseInt(format(parseISO(s.date), 'd'), 10);
    } catch {}
    return {
      day: dayNum,
      title: s.product.split(' ')[0], // short title
      time: '10:00 AM',
      type: s.status === 'Paid' ? 'meeting' : 'followup',
      subtitle: s.customer || 'Walk-in'
    };
  });

  return (
    <div className="flex flex-col min-h-screen text-gray-100 transition-all duration-200 bg-gray-900 animate-fadeIn">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto flex flex-col">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Calendar</h1>
            <p className="text-gray-400 text-sm">View and manage your sales activities, meetings and follow-ups</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
            <div className="flex gap-1">
                <button onClick={handleToday} className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition">Today</button>
                <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <button onClick={handlePrevDay} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 border-r border-gray-700 transition"><ChevronLeft size={18} /></button>
                    <button onClick={handleNextDay} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 transition"><ChevronRight size={18} /></button>
                </div>
            </div>
            <button 
              onClick={() => {
                if (inventory.length === 0) {
                  toast.error("Please add a product in Products / Services first!");
                  return;
                }
                setProduct(inventory[0]?.name || "");
                setRep(employees[0]?.name || "Arjun Kumar");
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Activity
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 pb-4">
          {/* Left Column */}
          <div className="col-span-1 xl:col-span-9 flex flex-col">
            <MainCalendarGrid 
              dbEvents={calendarEvents} 
              sales={filteredSales}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              view={calendarView}
              setView={setCalendarView}
            />
          </div>

          {/* Right Column */}
          <div className="col-span-1 xl:col-span-3 flex flex-col overflow-y-auto no-scrollbar">
            <MiniCalendarWidget selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
            <ActivityTypesWidget sales={filteredSales} />
            <TodaysAgendaWidget sales={filteredSales} />
          </div>
        </div>

      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Add Activity</h3>
            
            <form onSubmit={handleAddActivity} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1 text-xs">Customer Name</label>
                <input 
                  type="text" 
                  value={customer} 
                  onChange={(e) => setCustomer(e.target.value)} 
                  placeholder="e.g. Rajesh Enterprises" 
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">Sales Executive</label>
                  <select 
                    value={rep} 
                    onChange={(e) => setRep(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">Product / Service</label>
                  <select 
                    value={product} 
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  >
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.name}>{inv.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">Quantity</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    placeholder="e.g. 2"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">Unit Price (₹)</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="e.g. 15000"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-xs">Scheduled Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default CalendarPage;
