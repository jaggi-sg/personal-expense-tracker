// ==================== src/components/SaveTemplateModal.jsx ====================
import React, { useState } from 'react';
import { Save, X, Check } from 'lucide-react';

const SaveTemplateModal = ({ isOpen, onClose, onSave, currentFormData }) => {
  const [templateName, setTemplateName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    onSave(templateName.trim());
    setTemplateName('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save as Template
          </h3>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-purple-200 text-sm font-medium mb-2 block">
              Template Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Monthly Internet Bill"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-purple-300"
              autoFocus
            />
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-purple-200 text-xs font-semibold mb-2">Template Preview:</p>
            <div className="space-y-1 text-xs">
              <p className="text-white">Category: <span className="text-purple-300">{currentFormData.category || 'Not set'}</span></p>
              <p className="text-white">Description: <span className="text-purple-300">{currentFormData.description || 'Not set'}</span></p>
              <p className="text-white">Amount: <span className="text-green-300">${currentFormData.amount || '0.00'}</span></p>
              {currentFormData.paymentType && (
                <p className="text-white">Payment: <span className="text-purple-300">{currentFormData.paymentType}</span></p>
              )}
              {currentFormData.by && (
                <p className="text-white">Paid By: <span className="text-purple-300">{currentFormData.by}</span></p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Template
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;