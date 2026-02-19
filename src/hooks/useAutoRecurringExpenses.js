import { useEffect } from 'react';
import { generateAutoRecurringExpenses } from '../utils/autoRecurringExpenses';

export const useAutoRecurringExpenses = (expenses, categories, saveExpenses) => {
  useEffect(() => {
    // Run auto-generation check when component mounts and when expenses change
    const checkAndGenerate = () => {
      console.log('Checking for auto-generation...');
      const autoExpenses = generateAutoRecurringExpenses(expenses, categories);

      if (autoExpenses.length > 0) {
        console.log(`Auto-generating ${autoExpenses.length} recurring expenses`);
        const updatedExpenses = [...expenses, ...autoExpenses];
        saveExpenses(updatedExpenses);

        // Show notification to user
        const categoriesList = autoExpenses.map(e => e.category).join(', ');
        alert(`✨ Auto-generated ${autoExpenses.length} recurring expense(s) for: ${categoriesList}\n\nThese expenses have been set to PENDING with $0 amount. Please update them with actual amounts.`);
      }
    };

    // Only run if we have expenses and categories
    if (expenses.length > 0 && categories.length > 0) {
      checkAndGenerate();
    }
  }, [expenses.length, categories.length]); // Only re-run when counts change

  return null;
};