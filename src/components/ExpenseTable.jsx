import React from 'react';
import ExpenseRow from './ExpenseRow';
import CloneExpenseButton from './CloneExpenseButton';

const ExpenseTable = ({
  expenses,
  editingExpense,
  setEditingExpense,
  saveEdit,
  cancelEdit,
  deleteExpense,
  categories,
  paymentTypes,
  searchQuery,
  onClone,
  hasSubTransactions = false,
  expandedTransactions = {},
  onToggleExpanded = () => {}
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-max">
        <thead>
          <tr className="border-b border-white/20">
            <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap">Date</th>
            <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap">Month</th>
            <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap">Category</th>
            <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap">Description</th>
            <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap">Amount</th>
            <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap">Payment Type</th>
            <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap">Paid By</th>
            <th className="pb-3 pr-4 text-purple-200 font-semibold whitespace-nowrap">Status</th>
            <th className="pb-3 text-purple-200 font-semibold whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center py-8 text-purple-200">
                {searchQuery ? `No expenses found matching "${searchQuery}"` : 'No expenses found. Add your first expense above!'}
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                editingExpense={editingExpense}
                setEditingExpense={setEditingExpense}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                deleteExpense={deleteExpense}
                categories={categories}
                paymentTypes={paymentTypes}
                hasSubTransactions={hasSubTransactions}
                isExpanded={expandedTransactions[expense.id]}
                onToggleExpanded={onToggleExpanded}
                onClone={onClone}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;