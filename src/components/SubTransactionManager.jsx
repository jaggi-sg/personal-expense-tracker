import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const SubTransactionManager = ({
  showSubTransactions,
  setShowSubTransactions,
  subTransactions,
  addSubTransaction,
  updateSubTransaction,
  removeSubTransaction,
  totalAmount
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowSubTransactions(!showSubTransactions)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          {showSubTransactions ? 'Hide' : 'Add'} Multiple Transactions
        </button>
      </div>

      {showSubTransactions && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Individual Transactions</h3>
            <button
              onClick={addSubTransaction}
              className="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 text-xs flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Transaction
            </button>
          </div>
          {subTransactions.length === 0 ? (
            <p className="text-purple-200 text-sm">No transactions added. Click Add Transaction to start.</p>
          ) : (
            <div className="space-y-2">
              {subTransactions.map((st, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={st.date}
                    onChange={(e) => updateSubTransaction(index, 'date', e.target.value)}
                    className="bg-white/20 border border-white/30 rounded px-3 py-1.5 text-white text-sm w-36"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={st.description || ''}
                    onChange={(e) => updateSubTransaction(index, 'description', e.target.value)}
                    className="bg-white/20 border border-white/30 rounded px-3 py-1.5 text-white text-sm flex-1 placeholder-purple-300"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={st.amount}
                    onChange={(e) => updateSubTransaction(index, 'amount', e.target.value)}
                    className="bg-white/20 border border-white/30 rounded px-3 py-1.5 text-white text-sm w-32"
                  />
                  <button
                    onClick={() => removeSubTransaction(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="pt-2 border-t border-white/20">
                <p className="text-white font-semibold text-sm">Total: ${totalAmount || '0.00'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubTransactionManager;