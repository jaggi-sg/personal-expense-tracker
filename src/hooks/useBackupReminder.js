import { useState, useEffect } from 'react';

export const useBackupReminder = (exportToJSON, exportToCSV) => {
  const [showBackupReminder, setShowBackupReminder] = useState(false);

  useEffect(() => {
    checkBackupReminder();
  }, []);

  const checkBackupReminder = () => {
    const today = new Date();
    const lastBackup = localStorage.getItem('last-backup-date');
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysUntilMonthEnd = lastDayOfMonth - today.getDate();

    if (daysUntilMonthEnd <= 7) {
      if (lastBackup) {
        const lastBackupDate = new Date(lastBackup);
        const isSameMonth = lastBackupDate.getMonth() === currentMonth &&
                           lastBackupDate.getFullYear() === currentYear;
        if (!isSameMonth) {
          setShowBackupReminder(true);
        }
      } else {
        setShowBackupReminder(true);
      }
    }
  };

  const handleBackupNow = () => {
    exportToJSON();
    setTimeout(() => exportToCSV(), 500);
    localStorage.setItem('last-backup-date', new Date().toISOString());
    setShowBackupReminder(false);
    alert('Backup completed! JSON and CSV files have been downloaded.');
  };

  const dismissBackupReminder = () => {
    setShowBackupReminder(false);
    setTimeout(() => checkBackupReminder(), 24 * 60 * 60 * 1000);
  };

  return {
    showBackupReminder,
    handleBackupNow,
    dismissBackupReminder
  };
};