import React from 'react';
import { BarChart3, Calendar, TrendingUp, Activity } from 'lucide-react';
import NotificationIcon from './NotificationIcon';

const TabNavigation = ({ activeTab, setActiveTab, notifications = [] }) => {
  const tabs = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'recurring', label: 'Recurring Expenses', icon: Calendar },
    { id: 'non-recurring', label: 'Non-Recurring Expenses', icon: TrendingUp },
    { id: 'analytics', label: 'Advanced Analytics', icon: Activity },
    { id: 'visualizations', label: 'Visualizations', icon: BarChart3 }
  ];

  return (
    <div className="flex gap-2 mb-8 items-start relative">
      <div className="flex gap-2 flex-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-shrink-0">
        <NotificationIcon notifications={notifications} />
      </div>
    </div>
  );
};

export default TabNavigation;