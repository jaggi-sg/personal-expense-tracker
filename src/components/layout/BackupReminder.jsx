import React from 'react';
import { Download } from 'lucide-react';

const BackupReminder = ({ onBackupNow, onDismiss }) => {
  return (
    <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 shadow-2xl border-2 border-orange-300">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-2">
            <Download className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Monthly Backup Reminder</h3>
            <p className="text-orange-100 text-sm">
              It's time to backup your expense data! Click "Backup Now" to download JSON & CSV files.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBackupNow}
            className="bg-white text-orange-600 font-bold px-6 py-3 rounded-lg hover:bg-orange-50 transition-all flex items-center gap-2 shadow-lg"
          >
            <Download className="w-5 h-5" />
            Backup Now
          </button>
          <button
            onClick={onDismiss}
            className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-all"
          >
            Remind Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupReminder;