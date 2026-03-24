// ==================== src/components/CloneExpenseButton.jsx ====================
import React from 'react';
import { Copy } from 'lucide-react';

const CloneExpenseButton = ({ expense, onClone }) => {
  return (
    <button
      onClick={() => onClone(expense)}
      className="text-green-400 hover:text-green-300 transition-colors"
      title="Clone/Duplicate Expense"
    >
      <Copy className="w-5 h-5" />
    </button>
  );
};

export default CloneExpenseButton;