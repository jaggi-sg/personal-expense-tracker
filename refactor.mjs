#!/usr/bin/env node
// refactor.mjs — run from project root: node refactor.mjs
// Moves src files into feature-based folders and rewrites all imports.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── New folder structure ─────────────────────────────────────────────────────
//  src/
//    App.jsx  main.jsx  theme.css
//    components/
//      layout/     Header, TabNavigation, NotificationIcon, BackupReminder
//      expenses/   ExpenseTable, ExpenseRow, ExpenseRowBadges, ExpenseListControls,
//                  RecurringExpenses, NonRecurringExpenses, BulkEditModal,
//                  SkipMonthModal, QuickFilterChips, Pagination,
//                  CloneExpenseButton, SubTransactionManager
//      forms/      AddExpenseForm, AddExpenseSection, CurrencyInput,
//                  ExpenseFormFields, AdvancedFiltersSection, AdvancedSearchBar,
//                  FilterPresets, SaveTemplateModal, TemplateManager, TemplateQuickLoad
//      analytics/  AdvancedAnalytics, AnalyticsCards, CategoryDrillDownModal,
//                  MonthlyDrillDownModal, SpendingTimeline, Summary, SummaryCards, Visualizations
//      scanner/    ReceiptScanner, MobileScan, QRScanModal
//      modals/     ImportPreviewModal
//    hooks/   (unchanged)
//    utils/   (unchanged)

const FILE_MAP = {
  // root
  'src/main.jsx':  'src/main.jsx',
  'src/App.jsx':   'src/App.jsx',
  'src/theme.css': 'src/theme.css',

  // layout
  'src/components/Header.jsx':           'src/components/layout/Header.jsx',
  'src/components/TabNavigation.jsx':    'src/components/layout/TabNavigation.jsx',
  'src/components/NotificationIcon.jsx': 'src/components/layout/NotificationIcon.jsx',
  'src/components/BackupReminder.jsx':   'src/components/layout/BackupReminder.jsx',

  // expenses
  'src/components/ExpenseTable.jsx':          'src/components/expenses/ExpenseTable.jsx',
  'src/components/ExpenseRow.jsx':            'src/components/expenses/ExpenseRow.jsx',
  'src/components/ExpenseRowBadges.js':       'src/components/expenses/ExpenseRowBadges.js',
  'src/components/ExpenseListControls.jsx':   'src/components/expenses/ExpenseListControls.jsx',
  'src/components/RecurringExpenses.jsx':     'src/components/expenses/RecurringExpenses.jsx',
  'src/components/NonRecurringExpenses.jsx':  'src/components/expenses/NonRecurringExpenses.jsx',
  'src/components/BulkEditModal.jsx':         'src/components/expenses/BulkEditModal.jsx',
  'src/components/SkipMonthModal.jsx':        'src/components/expenses/SkipMonthModal.jsx',
  'src/components/QuickFilterChips.jsx':      'src/components/expenses/QuickFilterChips.jsx',
  'src/components/Pagination.jsx':            'src/components/expenses/Pagination.jsx',
  'src/components/CloneExpenseButton.jsx':    'src/components/expenses/CloneExpenseButton.jsx',
  'src/components/SubTransactionManager.jsx': 'src/components/expenses/SubTransactionManager.jsx',

  // forms
  'src/components/AddExpenseForm.jsx':         'src/components/forms/AddExpenseForm.jsx',
  'src/components/AddExpenseSection.jsx':      'src/components/forms/AddExpenseSection.jsx',
  'src/components/CurrencyInput.jsx':          'src/components/forms/CurrencyInput.jsx',
  'src/components/ExpenseFormFields.jsx':      'src/components/forms/ExpenseFormFields.jsx',
  'src/components/AdvancedFiltersSection.jsx': 'src/components/forms/AdvancedFiltersSection.jsx',
  'src/components/AdvancedSearchBar.jsx':      'src/components/forms/AdvancedSearchBar.jsx',
  'src/components/FilterPresets.jsx':          'src/components/forms/FilterPresets.jsx',
  'src/components/SaveTemplateModal.jsx':      'src/components/forms/SaveTemplateModal.jsx',
  'src/components/TemplateManager.jsx':        'src/components/forms/TemplateManager.jsx',
  'src/components/TemplateQuickLoad.jsx':      'src/components/forms/TemplateQuickLoad.jsx',

  // analytics
  'src/components/AdvancedAnalytics.jsx':      'src/components/analytics/AdvancedAnalytics.jsx',
  'src/components/AnalyticsCards.js':          'src/components/analytics/AnalyticsCards.js',
  'src/components/CategoryDrillDownModal.jsx': 'src/components/analytics/CategoryDrillDownModal.jsx',
  'src/components/MonthlyDrillDownModal.jsx':  'src/components/analytics/MonthlyDrillDownModal.jsx',
  'src/components/SpendingTimeline.jsx':       'src/components/analytics/SpendingTimeline.jsx',
  'src/components/Summary.jsx':                'src/components/analytics/Summary.jsx',
  'src/components/SummaryCards.jsx':           'src/components/analytics/SummaryCards.jsx',
  'src/components/Visualizations.jsx':         'src/components/analytics/Visualizations.jsx',

  // scanner
  'src/components/ReceiptScanner.jsx': 'src/components/scanner/ReceiptScanner.jsx',
  'src/components/MobileScan.jsx':     'src/components/scanner/MobileScan.jsx',
  'src/components/QRScanModal.jsx':    'src/components/scanner/QRScanModal.jsx',

  // modals
  'src/components/ImportPreviewModal.jsx': 'src/components/modals/ImportPreviewModal.jsx',

  // hooks (same location — imports get patched)
  'src/hooks/useAutoRecurringExpenses.js': 'src/hooks/useAutoRecurringExpenses.js',
  'src/hooks/useBackupReminder.js':        'src/hooks/useBackupReminder.js',
  'src/hooks/useCurrencyConverter.js':     'src/hooks/useCurrencyConverter.js',
  'src/hooks/useExpenseActions.js':        'src/hooks/useExpenseActions.js',
  'src/hooks/useExpenseData.js':           'src/hooks/useExpenseData.js',
  'src/hooks/useExpenseFilters.js':        'src/hooks/useExpenseFilters.js',
  'src/hooks/useExpenseForm.js':           'src/hooks/useExpenseForm.js',
  'src/hooks/useExpenseTemplates.js':      'src/hooks/useExpenseTemplates.js',
  'src/hooks/useFilterPresets.js':         'src/hooks/useFilterPresets.js',
  'src/hooks/useReceiptSync.js':           'src/hooks/useReceiptSync.js',
  'src/hooks/useTheme.js':                 'src/hooks/useTheme.js',

  // utils (same location — imports get patched)
  'src/utils/advancedFilterUtils.js':   'src/utils/advancedFilterUtils.js',
  'src/utils/autoRecurringExpenses.js': 'src/utils/autoRecurringExpenses.js',
  'src/utils/dataExport.js':            'src/utils/dataExport.js',
  'src/utils/expenseHelpers.js':        'src/utils/expenseHelpers.js',
  'src/utils/smartSearch.js':           'src/utils/smartSearch.js',
  'src/utils/summaryCalculations.js':   'src/utils/summaryCalculations.js',
};

// Build filename → new path lookup for import resolution
const NAME_TO_NEW = {};
for (const [, newRel] of Object.entries(FILE_MAP)) {
  NAME_TO_NEW[newRel.split('/').pop()] = newRel;
}

function rewriteImports(content, fromNewPath) {
  return content.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, importPath) => {
    const base = importPath.split('/').pop().replace(/\.(jsx?|tsx?)$/, '');
    let targetNew = null;
    for (const ext of ['.jsx', '.js', '.tsx', '.ts']) {
      if (NAME_TO_NEW[base + ext]) { targetNew = NAME_TO_NEW[base + ext]; break; }
    }
    if (!targetNew) return match;
    const fromDir   = dirname(join(__dirname, fromNewPath));
    const targetAbs = join(__dirname, targetNew);
    let rel = relative(fromDir, targetAbs).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = './' + rel;
    return `from '${rel.replace(/\.(jsx?|tsx?)$/, '')}'`;
  });
}

let moved = 0, patched = 0, skipped = 0;

for (const [oldRel, newRel] of Object.entries(FILE_MAP)) {
  const oldAbs = join(__dirname, oldRel);
  const newAbs = join(__dirname, newRel);

  if (!existsSync(oldAbs)) {
    console.log(`  SKIP  ${oldRel}`);
    skipped++;
    continue;
  }

  if (/\.css$/.test(oldRel)) {
    if (oldAbs !== newAbs) {
      mkdirSync(dirname(newAbs), { recursive: true });
      writeFileSync(newAbs, readFileSync(oldAbs));
      console.log(`  COPY  ${oldRel} → ${newRel}`);
      moved++;
    }
    continue;
  }

  const original  = readFileSync(oldAbs, 'utf8');
  const rewritten = rewriteImports(original, newRel);
  mkdirSync(dirname(newAbs), { recursive: true });
  writeFileSync(newAbs, rewritten, 'utf8');

  if (oldAbs !== newAbs) {
    console.log(`  MOVE  ${oldRel.slice(4)} → ${newRel.slice(4)}`);
    moved++;
  } else if (original !== rewritten) {
    console.log(`  PATCH ${newRel.slice(4)}`);
    patched++;
  } else {
    console.log(`  OK    ${newRel.slice(4)}`);
  }
}

console.log(`\nDone. ${moved} moved, ${patched} patched, ${skipped} skipped.`);
console.log('Next: npm run dev — then node cleanup-old-components.mjs');
