// src/components/TabNavigation.jsx

import React from 'react';
import { BarChart3, Calendar, TrendingUp, Activity, PieChart } from 'lucide-react';
import NotificationIcon from './NotificationIcon';

const TABS = [
  { id: 'summary',       label: 'Summary',       short: 'Summary',    icon: BarChart3  },
  { id: 'recurring',     label: 'Recurring',      short: 'Recurring',  icon: Calendar   },
  { id: 'non-recurring', label: 'Non-Recurring',  short: 'Non-Rec',    icon: TrendingUp },
  { id: 'analytics',     label: 'Analytics',      short: 'Analytics',  icon: Activity   },
  { id: 'visualizations',label: 'Visualizations', short: 'Visual',     icon: PieChart   },
];

const TabNavigation = ({ activeTab, setActiveTab, notifications = [] }) => {
  const recurringBadge    = notifications.filter(n => n.type === 'Recurring'    && (n.status === 'OVERDUE' || n.status === 'PENDING')).length;
  const nonRecurringBadge = notifications.filter(n => n.type === 'Non-Recurring' && (n.status === 'OVERDUE' || n.status === 'PENDING')).length;

  return (
    <div className="flex items-center justify-between mb-6 border-b border-white/10">
      {/* Tab list */}
      <div className="flex items-end gap-1 overflow-x-auto scrollbar-none pb-0">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon     = tab.icon;

          const badgeCount =
            tab.id === 'recurring'     ? recurringBadge :
            tab.id === 'non-recurring' ? nonRecurringBadge : 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                transition-colors duration-150 focus:outline-none group
                ${isActive
                  ? 'text-white'
                  : 'text-purple-400 hover:text-purple-200'}`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-300' : 'text-purple-500 group-hover:text-purple-400'}`} />

              {/* Full label on md+, short on small */}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>

              {/* Notification dot */}
              {badgeCount > 0 && !isActive && (
                <span className="flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 leading-none -mt-0.5">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}

              {/* Active underline */}
              <span
                className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200
                  ${isActive ? 'bg-purple-400 opacity-100' : 'bg-transparent opacity-0 group-hover:bg-white/20 group-hover:opacity-100'}`}
              />
            </button>
          );
        })}
      </div>

      {/* Notification icon — right side */}
      <div className="flex-shrink-0 pb-1 pl-2">
        <NotificationIcon notifications={notifications} />
      </div>
    </div>
  );
};

export default TabNavigation;