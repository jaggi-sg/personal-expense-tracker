import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

const NotificationIcon = ({ notifications = [] }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingCount = notifications.filter(n => n.status === 'PENDING').length;
  const overdueCount = notifications.filter(n => n.status === 'OVERDUE').length;
  const totalCount = notifications.length;

  console.log('NotificationIcon - Total:', totalCount, 'Pending:', pendingCount, 'Overdue:', overdueCount);
  console.log('Dropdown visible:', showDropdown);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Bell clicked! Current state:', showDropdown);
    setShowDropdown(prev => {
      console.log('Setting dropdown to:', !prev);
      return !prev;
    });
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} style={{ zIndex: 1000 }}>
      <button
        type="button"
        onClick={handleClick}
        className="relative flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all bg-white/10 text-purple-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <Bell className="w-5 h-5" />

        {/* Pending Badge (Orange) - Top Right */}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center shadow-lg animate-pulse">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}

        {/* Overdue Badge (Red) - Bottom Right */}
        {overdueCount > 0 && (
          <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center shadow-lg animate-pulse">
            {overdueCount > 9 ? '9+' : overdueCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          className="fixed md:absolute right-0 md:right-0 mt-2 w-[calc(100vw-2rem)] md:w-96 bg-slate-800 rounded-xl shadow-2xl border border-purple-500/30 max-h-[70vh] md:max-h-[500px] overflow-y-auto"
          style={{
            zIndex: 99999,
            left: 'auto',
            top: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {totalCount > 0 ? (
            <>
              <div className="sticky top-0 p-4 border-b border-purple-500/30 bg-slate-900">
                <h3 className="text-white font-bold text-md flex items-center justify-between">
                  Payment Notifications
                  <div className="flex items-center gap-2">
                    {overdueCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 animate-pulse">
                        {overdueCount} Overdue
                      </span>
                    )}
                    {pendingCount > 0 && (
                      <span className="bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-1 animate-pulse">
                        {pendingCount} Pending
                      </span>
                    )}
                  </div>
                </h3>
              </div>

              <div className="divide-y divide-purple-500/20">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors ${
                      notification.status === 'PENDING'
                        ? 'bg-orange-500/10'
                        : 'bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                        notification.status === 'PENDING' ? 'bg-orange-500' : 'bg-red-500'
                      } animate-pulse`}></div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${
                          notification.status === 'PENDING' ? 'text-orange-200' : 'text-red-200'
                        }`}>
                          {notification.status === 'PENDING' ? (
                            notification.isCurrentMonth ? (
                              `${notification.category} payment for ${notification.monthYear} is PENDING by end of ${notification.month}`
                            ) : (
                              `${notification.category} payment for ${notification.monthYear} is PENDING - Please update status`
                            )
                          ) : (
                            `${notification.category} payment for ${notification.monthYear} is OVERDUE by ${notification.daysDiff} days`
                          )}
                        </p>
                        <p className={`text-xs mt-1 ${
                          notification.status === 'PENDING' ? 'text-orange-300' : 'text-red-300'
                        }`}>
                          Amount: ${notification.amount.toFixed(2)} | {notification.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-200 font-medium text-lg">No notifications</p>
              <p className="text-purple-400 text-sm mt-2">All payments are up to date!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;