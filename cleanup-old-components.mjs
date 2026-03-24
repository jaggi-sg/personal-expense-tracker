#!/usr/bin/env node
// cleanup-old-components.mjs
// Run AFTER refactor.mjs and AFTER confirming npm run dev works.
// Deletes the original flat component files that have been moved to subfolders.

import { unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TO_DELETE = [
  // layout
  'src/components/Header.jsx',
  'src/components/TabNavigation.jsx',
  'src/components/NotificationIcon.jsx',
  'src/components/BackupReminder.jsx',
  // expenses
  'src/components/ExpenseTable.jsx',
  'src/components/ExpenseRow.jsx',
  'src/components/ExpenseRowBadges.js',
  'src/components/ExpenseListControls.jsx',
  'src/components/RecurringExpenses.jsx',
  'src/components/NonRecurringExpenses.jsx',
  'src/components/BulkEditModal.jsx',
  'src/components/SkipMonthModal.jsx',
  'src/components/QuickFilterChips.jsx',
  'src/components/Pagination.jsx',
  'src/components/CloneExpenseButton.jsx',
  'src/components/SubTransactionManager.jsx',
  // forms
  'src/components/AddExpenseForm.jsx',
  'src/components/AddExpenseSection.jsx',
  'src/components/CurrencyInput.jsx',
  'src/components/ExpenseFormFields.jsx',
  'src/components/AdvancedFiltersSection.jsx',
  'src/components/AdvancedSearchBar.jsx',
  'src/components/FilterPresets.jsx',
  'src/components/SaveTemplateModal.jsx',
  'src/components/TemplateManager.jsx',
  'src/components/TemplateQuickLoad.jsx',
  // analytics
  'src/components/AdvancedAnalytics.jsx',
  'src/components/AnalyticsCards.js',
  'src/components/CategoryDrillDownModal.jsx',
  'src/components/MonthlyDrillDownModal.jsx',
  'src/components/SpendingTimeline.jsx',
  'src/components/Summary.jsx',
  'src/components/SummaryCards.jsx',
  'src/components/Visualizations.jsx',
  // scanner
  'src/components/ReceiptScanner.jsx',
  'src/components/MobileScan.jsx',
  'src/components/QRScanModal.jsx',
  // modals
  'src/components/ImportPreviewModal.jsx',
];

let deleted = 0;
for (const rel of TO_DELETE) {
  const abs = join(__dirname, rel);
  if (existsSync(abs)) {
    unlinkSync(abs);
    console.log(`  DELETED: ${rel}`);
    deleted++;
  } else {
    console.log(`  SKIP:    ${rel}`);
  }
}
console.log(`\nDone. ${deleted} old files removed.`);
