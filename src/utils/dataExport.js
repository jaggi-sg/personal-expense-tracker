// src/utils/dataExport.js

const dateSuffix = () => new Date().toISOString().split('T')[0];

const download = (blob, filename) => {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// ── Expenses only ─────────────────────────────────────────────────────────────
export const exportToJSON = (expenses, filename = 'expenses') => {
  if (!expenses?.length) { alert('No expenses to export'); return; }
  download(new Blob([JSON.stringify(expenses, null, 2)], { type: 'application/json' }), `${filename}-${dateSuffix()}.json`);
};

export const exportToCSV = (expenses, filename = 'expenses') => {
  if (!expenses?.length) { alert('No expenses to export'); return; }
  const headers = ['Date','Month','Category','Description','Type','Amount','Payment Type','By','Status'];
  const rows = [headers.join(',')];
  expenses.forEach(exp => {
    rows.push([
      exp.date, exp.month, exp.category,
      `"${(exp.description  || '').replace(/"/g,'""')}"`,
      exp.type, exp.amount,
      `"${(exp.paymentType  || '').replace(/"/g,'""')}"`,
      `"${(exp.by           || '').replace(/"/g,'""')}"`,
      exp.status
    ].join(','));
  });
  download(new Blob([rows.join('\n')], { type: 'text/csv' }), `${filename}-${dateSuffix()}.csv`);
};

// ── Full backup — expenses + all lookup lists ─────────────────────────────────
export const exportFullBackup = ({ expenses, categories, nonRecurringCategories, paymentTypes }) => {
  const payload = {
    _version:              2,
    _exportedAt:           new Date().toISOString(),
    expenses:              expenses              || [],
    categories:            categories            || [],
    nonRecurringCategories:nonRecurringCategories|| [],
    paymentTypes:          paymentTypes          || [],
  };
  download(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `expense-tracker-backup-${dateSuffix()}.json`
  );
};

// ── Parse a file and return a preview diff object ─────────────────────────────
// Returns: { type: 'full'|'expenses'|'csv', preview, raw }
export const parseImportFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;

      if (file.name.endsWith('.csv')) {
        const lines    = text.split('\n');
        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const v = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
          if (v && v.length >= 9) {
            imported.push({
              id:          Date.now().toString() + i,
              date:        v[0].replace(/"/g,''),
              month:       v[1].replace(/"/g,''),
              category:    v[2].replace(/"/g,''),
              description: v[3].replace(/"/g,''),
              type:        v[4].replace(/"/g,''),
              amount:      parseFloat(v[5].replace(/"/g,'')) || 0,
              paymentType: v[6].replace(/"/g,''),
              by:          v[7].replace(/"/g,''),
              status:      v[8].replace(/"/g,''),
            });
          }
        }
        resolve({ type: 'csv', expenses: imported, categories: [], nonRecurringCategories: [], paymentTypes: [] });

      } else {
        const parsed = JSON.parse(text);

        // Full backup format
        if (parsed._version && parsed.expenses) {
          resolve({
            type:                  'full',
            expenses:              parsed.expenses              || [],
            categories:            parsed.categories            || [],
            nonRecurringCategories:parsed.nonRecurringCategories|| [],
            paymentTypes:          parsed.paymentTypes          || [],
          });
        // Plain expenses array
        } else if (Array.isArray(parsed)) {
          resolve({ type: 'expenses', expenses: parsed, categories: [], nonRecurringCategories: [], paymentTypes: [] });
        } else {
          reject(new Error('Unrecognised JSON format'));
        }
      }
    } catch (err) {
      reject(err);
    }
  };
  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsText(file);
});

// ── Compute diff for preview modal ────────────────────────────────────────────
export const computeImportDiff = (incoming, existing) => {
  const existingIds  = new Set(existing.map(e => e.id));
  const existingKeys = new Set(existing.map(e => `${e.date}|${e.description}|${e.amount}`));

  const brandNew    = [];
  const duplicates  = [];
  const updates     = [];

  incoming.forEach(exp => {
    const key = `${exp.date}|${exp.description}|${exp.amount}`;
    if (existingIds.has(exp.id)) {
      updates.push(exp);       // same ID → update
    } else if (existingKeys.has(key)) {
      duplicates.push(exp);    // same date+desc+amount → likely duplicate
    } else {
      brandNew.push(exp);      // net new
    }
  });

  return { brandNew, duplicates, updates };
};

// ── Legacy imports (still used for backwards compat, now go through preview) ──
export const importFromJSON = (e, expenses, saveExpenses) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (Array.isArray(parsed)) {
        saveExpenses(parsed);
        alert('Data imported successfully!');
      } else {
        alert('Invalid JSON format');
      }
    } catch (err) {
      alert('Error reading JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
};

export const importFromCSV = (e, expenses, saveExpenses) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const lines    = ev.target.result.split('\n');
      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const v = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
        if (v && v.length >= 9) {
          imported.push({
            id: Date.now().toString() + i,
            date: v[0].replace(/"/g,''), month: v[1].replace(/"/g,''),
            category: v[2].replace(/"/g,''), description: v[3].replace(/"/g,''),
            type: v[4].replace(/"/g,''), amount: parseFloat(v[5].replace(/"/g,'')) || 0,
            paymentType: v[6].replace(/"/g,''), by: v[7].replace(/"/g,''),
            status: v[8].replace(/"/g,''),
          });
        }
      }
      if (imported.length) { saveExpenses([...expenses, ...imported]); alert(`Imported ${imported.length} expenses!`); }
      else alert('No valid data found in CSV');
    } catch (err) {
      alert('Error reading CSV: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
};