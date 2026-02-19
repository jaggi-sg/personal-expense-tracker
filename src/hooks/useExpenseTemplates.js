// src/hooks/useExpenseTemplates.js
import { useState, useEffect } from 'react';

export const useExpenseTemplates = () => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem('expense-templates');
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const saveTemplates = (newTemplates) => {
    try {
      localStorage.setItem('expense-templates', JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error('Failed to save templates:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const addTemplate = (templateData, templateName) => {
    const newTemplate = {
      id: Date.now().toString(),
      name: templateName,
      type: templateData.type,
      category: templateData.category,
      description: templateData.description,
      amount: parseFloat(templateData.amount) || 0,
      paymentType: templateData.paymentType || '',
      by: templateData.by || '',
      status: templateData.status || 'PAID',
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);
    return newTemplate;
  };

  const deleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(updatedTemplates);
  };

  const toggleFavorite = (templateId) => {
    const updatedTemplates = templates.map(t =>
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    );
    saveTemplates(updatedTemplates);
  };

  const updateTemplate = (templateId, updates) => {
    const updatedTemplates = templates.map(t =>
      t.id === templateId ? { ...t, ...updates } : t
    );
    saveTemplates(updatedTemplates);
  };

  return {
    templates,
    addTemplate,
    deleteTemplate,
    toggleFavorite,
    updateTemplate
  };
};