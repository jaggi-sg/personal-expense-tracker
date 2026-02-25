// src/utils/dataExport.js

const dateSuffix = () => new Date().toISOString().split('T')[0];

export const exportToJSON = (expenses, filename = 'expenses') => {
  if (!expenses || expenses.length === 0) {
    alert('No expenses to export');
    return;
  }
  const dataStr  = JSON.stringify(expenses, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url      = URL.createObjectURL(dataBlob);
  const link     = document.createElement('a');
  link.href      = url;
  link.download  = `${filename}-${dateSuffix()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (expenses, filename = 'expenses') => {
  if (!expenses || expenses.length === 0) {
    alert('No expenses to export');
    return;
  }

  const headers = ['Date', 'Month', 'Category', 'Description', 'Type', 'Amount', 'Payment Type', 'By', 'Status'];
  const csvRows = [headers.join(',')];

  expenses.forEach(exp => {
    const row = [
      exp.date,
      exp.month,
      exp.category,
      `"${(exp.description || '').replace(/"/g, '""')}"`,
      exp.type,
      exp.amount,
      `"${(exp.paymentType || '').replace(/"/g, '""')}"`,
      `"${(exp.by || '').replace(/"/g, '""')}"`,
      exp.status
    ];
    csvRows.push(row.join(','));
  });

  const csvStr   = csvRows.join('\n');
  const dataBlob = new Blob([csvStr], { type: 'text/csv' });
  const url      = URL.createObjectURL(dataBlob);
  const link     = document.createElement('a');
  link.href      = url;
  link.download  = `${filename}-${dateSuffix()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importFromJSON = (e, expenses, saveExpenses) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          saveExpenses(imported);
          alert('Data imported successfully!');
        } else {
          alert('Invalid JSON format');
        }
      } catch (error) {
        alert('Error reading JSON file: ' + error.message);
      }
    };
    reader.readAsText(file);
  }
  e.target.value = '';
};

export const importFromCSV = (e, expenses, saveExpenses) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const lines   = csvText.split('\n');
        const imported = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
            if (values && values.length >= 9) {
              imported.push({
                id         : Date.now().toString() + i,
                date       : values[0].replace(/"/g, ''),
                month      : values[1].replace(/"/g, ''),
                category   : values[2].replace(/"/g, ''),
                description: values[3].replace(/"/g, ''),
                type       : values[4].replace(/"/g, ''),
                amount     : parseFloat(values[5].replace(/"/g, '')) || 0,
                paymentType: values[6].replace(/"/g, ''),
                by         : values[7].replace(/"/g, ''),
                status     : values[8].replace(/"/g, '')
              });
            }
          }
        }

        if (imported.length > 0) {
          saveExpenses([...expenses, ...imported]);
          alert(`Imported ${imported.length} expenses successfully!`);
        } else {
          alert('No valid data found in CSV');
        }
      } catch (error) {
        alert('Error reading CSV file: ' + error.message);
      }
    };
    reader.readAsText(file);
  }
  e.target.value = '';
};