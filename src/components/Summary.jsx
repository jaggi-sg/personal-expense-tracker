import React, { useEffect } from 'react';
import { Calendar, TrendingUp, Download, Upload, Home, Wifi, Zap, Trash as TrashIcon, Building2, Droplet, Phone, Tv, DollarSign, Wrench, Package, Fuel, ShoppingCart } from 'lucide-react';

const Summary = ({
  expenses,
  categories,
  nonRecurringCategories,
  filterYear,
  setFilterYear,
  availableYears,
  getCategorySummary,
  getYearlyTotal,
  getPendingAndOverdueExpenses,
  exportToJSON,
  exportToCSV,
  importFromJSON,
  importFromCSV
}) => {
  // Set current year as default on component mount
  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    if (filterYear === 'All' && availableYears.includes(parseInt(currentYear))) {
      setFilterYear(currentYear);
    }
  }, []);

  const recurringExpenses = expenses.filter(exp => exp.type === 'Recurring');
  const nonRecurringExpenses = expenses.filter(exp => exp.type === 'Non-Recurring');

  // Filter expenses by year for totals
  const filteredRecurringExpenses = recurringExpenses.filter(exp => {
    const expYear = new Date(exp.date + 'T00:00:00Z').getUTCFullYear().toString();
    const yearMatch = filterYear === 'All' || expYear === filterYear;
    return yearMatch && exp.status === 'PAID';
  });

  const filteredNonRecurringExpenses = nonRecurringExpenses.filter(exp => {
    const expYear = new Date(exp.date + 'T00:00:00Z').getUTCFullYear().toString();
    const yearMatch = filterYear === 'All' || expYear === filterYear;
    return yearMatch && exp.status === 'PAID';
  });

  const recurringTotal = filteredRecurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const nonRecurringTotal = filteredNonRecurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Mortgage': <Home className="w-5 h-5" />,
      'Rent': <Building2 className="w-5 h-5" />,
      'Internet': <Wifi className="w-5 h-5" />,
      'Electricity': <Zap className="w-5 h-5" />,
      'Trash': <TrashIcon className="w-5 h-5" />,
      'HOA': <Building2 className="w-5 h-5" />,
      'Water': <Droplet className="w-5 h-5" />,
      'Phone Bill': <Phone className="w-5 h-5" />,
      'Subscription': <Tv className="w-5 h-5" />,
      'Handyman': <Wrench className="w-5 h-5" />,
      'Home Improvement': <Home className="w-5 h-5" />,
      'Gas': <Fuel className="w-5 h-5" />,
      'Costco': <ShoppingCart className="w-5 h-5" />,
      'Amazon': <Package className="w-5 h-5" />
    };
    return iconMap[category] || <DollarSign className="w-5 h-5" />;
  };

  return (
    <>
      {/* Recurring Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Recurring Total Card - Left Side */}
        <div className="lg:col-span-3">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 h-full">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-green-300" />
              <h3 className="text-purple-200 text-sm font-semibold">Total Recurring (Paid)</h3>
            </div>
            <p className="text-4xl font-bold text-white mt-4">${recurringTotal.toFixed(2)}</p>
            <p className="text-purple-300 text-sm mt-2">
              {filteredRecurringExpenses.length} paid transaction(s)
            </p>
            <p className="text-purple-400 text-xs mt-1">
              {filterYear === 'All' ? 'All Years' : `Year ${filterYear}`}
            </p>
          </div>
        </div>

        {/* Recurring Summary - Right Side */}
        <div className="lg:col-span-9">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recurring Expenses Summary</h2>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="All">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="mb-3 text-purple-200 text-xs">
              Total Paid for {filterYear === 'All' ? 'All Years' : filterYear}: <span className="text-white font-bold text-base">${getYearlyTotal('Recurring').toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(getCategorySummary('Recurring'))
                .sort(([, a], [, b]) => b - a)
                .map(([category, total]) => (
                <div key={category} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-purple-300">
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="text-purple-200 text-xs truncate">{category}</h3>
                  </div>
                  <p className="text-xl font-bold text-white">${total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Non-Recurring Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Non-Recurring Total Card - Left Side */}
        <div className="lg:col-span-3">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 h-full">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-300" />
              <h3 className="text-purple-200 text-sm font-semibold">Total Non-Recurring (Paid)</h3>
            </div>
            <p className="text-4xl font-bold text-white mt-4">${nonRecurringTotal.toFixed(2)}</p>
            <p className="text-purple-300 text-sm mt-2">
              {filteredNonRecurringExpenses.length} paid transaction(s)
            </p>
            <p className="text-purple-400 text-xs mt-1">
              {filterYear === 'All' ? 'All Years' : `Year ${filterYear}`}
            </p>
          </div>
        </div>

        {/* Non-Recurring Summary - Right Side */}
        <div className="lg:col-span-9">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Non-Recurring Expenses Summary</h2>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="All">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="mb-3 text-purple-200 text-xs">
              Total Paid for {filterYear === 'All' ? 'All Years' : filterYear}: <span className="text-white font-bold text-base">${getYearlyTotal('Non-Recurring').toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(getCategorySummary('Non-Recurring'))
                .sort(([, a], [, b]) => b - a)
                .map(([category, total]) => (
                <div key={category} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-purple-300">
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="text-purple-200 text-xs truncate">{category}</h3>
                  </div>
                  <p className="text-xl font-bold text-white">${total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToJSON}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>

          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <label className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            Import JSON
            <input type="file" accept=".json" onChange={importFromJSON} className="hidden" />
          </label>

          <label className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            Import CSV
            <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
          </label>
        </div>
      </div>
    </>
  );
};

export default Summary;