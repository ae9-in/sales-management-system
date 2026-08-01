// frontend/src/modals/Filters.jsx - Filter options modal component
import React from "react";
import { X } from "lucide-react";

const Filters = ({
  showFilters,setShowFilters,filters,handleFilterChange,resetFilters,applyFilters,
  fields,
  title = "Filter Options",
}) => {
  if (!showFilters) return null;

  const renderField = (field) => {
    switch (field.type) {
      case "select":
        return (
          <select
            name={field.name}
            value={filters[field.name] || ""}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 text-gray-900 glass-card rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {field.options.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      case "range":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500">Minimum</label>
              <input
                type="number"
                name={`${field.name}Min`}
                value={filters[`${field.name}Min`] || ""}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 text-gray-900 glass-card rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Maximum</label>
              <input
                type="number"
                name={`${field.name}Max`}
                value={filters[`${field.name}Max`] || ""}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 text-gray-900 glass-card rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Max"
              />
            </div>
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            name={field.name}
            value={filters[field.name] || ""}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 text-gray-900 glass-card rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-modalFadeIn">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-modalFadeIn" />
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl animate-modalSlideIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-medium text-gray-900">{title}</h3>
          <button onClick={() => setShowFilters(false)} className="text-gray-500 transition-transform duration-200 hover:text-gray-900 hover:rotate-90" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={`${field.type === "range" ? "md:col-span-2" : ""} transition-all duration-200 hover:scale-[1.02]`}>
                <label className="block mb-1 text-sm font-medium text-gray-600">{field.label}</label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 bg-white border-t border-gray-200">
          <button onClick={() => { resetFilters(); setShowFilters(false); }} className="px-4 py-2 mr-2 text-gray-600 transition-all bg-gray-100 rounded-md hover:bg-gray-600 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Reset
          </button>
          <button onClick={() => { applyFilters(); setShowFilters(false); }} className="px-4 py-2 text-gray-900 transition-all bg-emerald-600 rounded-md hover:bg-emerald-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;




