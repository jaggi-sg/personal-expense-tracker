#!/usr/bin/env node
// rollback.mjs — run from project root: node rollback.mjs
// Reverses refactor.mjs — moves files back to flat src/components/ structure.
// TIP: git reset HEAD~1 --hard is faster if you committed before refactoring.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Same FILE_MAP as refactor.mjs — key=new location, value=old location
const FILE_MAP = {
  'src/main.jsx':  'src/main.jsx',
  'src/App.jsx':   'src/App.jsx',
  'src/theme.css': 'src/theme.css',

  'src/components/layout/Header.jsx':           'src/components/Header.jsx',
  'src/components/layout/TabNavigation.jsx':    'src/components/TabNavigation.jsx',
  'src/components/layout/NotificationIcon.jsx': 'src/components/NotificationIcon.jsx',
  'src/components/layout/BackupReminder.jsx':   'src/components/BackupReminder.jsx',

  'src/components/expenses/ExpenseTable.jsx':          'src/components/ExpenseTable.jsx',
  'src/components/expenses/ExpenseRow.jsx':             'src/components/ExpenseRow.jsx',
  'src/components/expenses/ExpenseRowBadges.js':        'src/components/ExpenseRowBadges.js',
  'src/components/expenses/ExpenseListControls.jsx':    'src/components/ExpenseListControls.jsx',
  'src/components/expenses/RecurringExpenses.jsx':      'src/components/RecurringExpenses.jsx',
  'src/components/expenses/NonRecurringExpenses.jsx':   'src/components/NonRecurringExpenses.jsx',
  'src/components/expenses/BulkEditModal.jsx':          'src/components/BulkEditModal.jsx',
  'src/components/expenses/SkipMonthModal.jsx':         'src/components/SkipMonthModal.jsx',
  'src/components/expenses/QuickFilterChips.jsx':       'src/components/QuickFilterChips.jsx',
  'src/components/expenses/Pagination.jsx':             'src/components/Pagination.jsx',
  'src/components/expenses/CloneExpenseButton.jsx':     'src/components/CloneExpenseButton.jsx',
  'src/components/expenses/SubTransactionManager.jsx':  'src/components/SubTransactionManager.jsx',

  'src/components/forms/AddExpenseForm.jsx':         'src/components/AddExpenseForm.jsx',
  'src/components/forms/AddExpenseSection.jsx':      'src/components/AddExpenseSection.jsx',
  'src/components/forms/CurrencyInput.jsx':          'src/components/CurrencyInput.jsx',
  'src/components/forms/ExpenseFormFields.jsx':      'src/components/ExpenseFormFields.jsx',
  'src/components/forms/AdvancedFiltersSection.jsx': 'src/components/AdvancedFiltersSection.jsx',
  'src/components/forms/AdvancedSearchBar.jsx':      'src/components/AdvancedSearchBar.jsx',
  'src/components/forms/FilterPresets.jsx':          'src/components/FilterPresets.jsx',
  'src/components/forms/SaveTemplateModal.jsx':      'src/components/SaveTemplateModal.jsx',
  'src/components/forms/TemplateManager.jsx':        'src/components/TemplateManager.jsx',
  'src/components/forms/TemplateQuickLoad.jsx':      'src/components/TemplateQuickLoad.jsx',

  'src/components/analytics/AdvancedAnalytics.jsx':      'src/components/AdvancedAnalytics.jsx',
  'src/components/analytics/AnalyticsCards.js':          'src/components/AnalyticsCards.js',
  'src/components/analytics/CategoryDrillDownModal.jsx': 'src/components/CategoryDrillDownModal.jsx',
  'src/components/analytics/MonthlyDrillDownModal.jsx':  'src/components/MonthlyDrillDownModal.jsx',
  'src/components/analytics/SpendingTimeline.jsx':       'src/components/SpendingTimeline.jsx',
  'src/components/analytics/Summary.jsx':                'src/components/Summary.jsx',
  'src/components/analytics/SummaryCards.jsx':           'src/components/SummaryCards.jsx',
  'src/components/analytics/Visualizations.jsx':         'src/components/Visualizations.jsx',

  'src/components/scanner/ReceiptScanner.jsx': 'src/components/ReceiptScanner.jsx',
  'src/components/scanner/MobileScan.jsx':     'src/components/MobileScan.jsx',
  'src/components/scanner/QRScanModal.jsx':    'src/components/QRScanModal.jsx',

  'src/components/modals/ImportPreviewModal.jsx': 'src/components/ImportPreviewModal.jsx',

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

  'src/utils/advancedFilterUtils.js':   'src/utils/advancedFilterUtils.js',
  'src/utils/autoRecurringExpenses.js': 'src/utils/autoRecurringExpenses.js',
  'src/utils/dataExport.js':            'src/utils/dataExport.js',
  'src/utils/expenseHelpers.js':        'src/utils/expenseHelpers.js',
  'src/utils/smartSearch.js':           'src/utils/smartSearch.js',
  'src/utils/summaryCalculations.js':   'src/utils/summaryCalculations.js',
};

// Build filename → old path lookup
const NAME_TO_OLD = {};
for (const [, oldRel] of Object.entries(FILE_MAP)) {
  NAME_TO_OLD[oldRel.split('/').pop()] = oldRel;
}

function rewriteImports(content, toOldPath) {
  return content.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, importPath) => {
    const base = importPath.split('/').pop().replace(/\.(jsx?|tsx?)$/, '');
    let targetOld = null;
    for (const ext of ['.jsx', '.js', '.tsx', '.ts']) {
      if (NAME_TO_OLD[base + ext]) { targetOld = NAME_TO_OLD[base + ext]; break; }
    }
    if (!targetOld) return match;
    const fromDir   = dirname(join(__dirname, toOldPath));
    const targetAbs = join(__dirname, targetOld);
    let rel = relative(fromDir, targetAbs).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = './' + rel;
    return `from '${rel.replace(/\.(jsx?|tsx?)$/, '')}'`;
  });
}

let restored = 0, skipped = 0;

for (const [newRel, oldRel] of Object.entries(FILE_MAP)) {
  const newAbs = join(__dirname, newRel);
  const oldAbs = join(__dirname, oldRel);

  if (!existsSync(newAbs)) {
    console.log(`  SKIP  ${newRel}`);
    skipped++;
    continue;
  }

  if (/\.css$/.test(newRel)) {
    if (newAbs !== oldAbs) {
      mkdirSync(dirname(oldAbs), { recursive: true });
      writeFileSync(oldAbs, readFileSync(newAbs));
      console.log(`  COPY  ${newRel} → ${oldRel}`);
      restored++;
    }
    continue;
  }

  const content   = readFileSync(newAbs, 'utf8');
  const rewritten = rewriteImports(content, oldRel);
  mkdirSync(dirname(oldAbs), { recursive: true });
  writeFileSync(oldAbs, rewritten, 'utf8');

  if (newAbs !== oldAbs) {
    console.log(`  RESTORE ${newRel.slice(4)} → ${oldRel.slice(4)}`);
    restored++;
  } else {
    console.log(`  PATCH   ${oldRel.slice(4)}`);
    restored++;
  }
}

// Remove feature subfolders
const SUBFOLDERS = [
  'src/components/layout',
  'src/components/expenses',
  'src/components/forms',
  'src/components/analytics',
  'src/components/scanner',
  'src/components/modals',
];

console.log('\nRemoving subfolders...');
for (const rel of SUBFOLDERS) {
  const abs = join(__dirname, rel);
  if (existsSync(abs)) {
    rmSync(abs, { recursive: true, force: true });
    console.log(`  REMOVED ${rel}/`);
  }
}

console.log(`\nRollback done. ${restored} files restored, ${skipped} skipped.`);
console.log('Run: npm run dev');
