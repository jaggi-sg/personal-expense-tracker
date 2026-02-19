import React from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

const SummaryCards = ({
  totalAmount,
  totalEntries,
  filteredTotal,
  filterDescription,
  type = 'Recurring'
}) => {
  const iconColor = type === 'Recurring' ? 'text-green-300' : 'text-blue-300';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
      <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className={`w-6 h-6 ${iconColor}`} />
          <h3 className="text-purple-200 text-sm">Total {type} (Paid)</h3>
        </div>
        <p className="text-3xl font-bold text-white">${totalAmount.toFixed(2)}</p>
      </div>

      <div className="md:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-6 h-6 text-blue-300" />
          <h3 className="text-purple-200 text-sm">Total Entries</h3>
        </div>
        <p className="text-3xl font-bold text-white">{totalEntries}</p>
      </div>

      <div className="md:col-span-7 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-purple-300" />
          <h3 className="text-purple-200 text-sm">Filtered Total (Paid)</h3>
        </div>
        <p className="text-3xl font-bold text-white">${filteredTotal.toFixed(2)}</p>
        <p className="text-purple-300 text-sm mt-2">
          Showing: {filterDescription}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;