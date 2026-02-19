// src/hooks/useFilterPresets.js

import { useState, useEffect } from 'react';

export const useFilterPresets = () => {
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    try {
      const stored = localStorage.getItem('filter-presets');
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
    }
  };

  const savePresets = (newPresets) => {
    try {
      localStorage.setItem('filter-presets', JSON.stringify(newPresets));
      setPresets(newPresets);
    } catch (error) {
      console.error('Failed to save filter presets:', error);
      alert('Failed to save preset. Please try again.');
    }
  };

  const addPreset = (name, criteria) => {
    const newPreset = {
      id: Date.now().toString(),
      name,
      criteria,
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    const updatedPresets = [...presets, newPreset];
    savePresets(updatedPresets);
    return newPreset;
  };

  const deletePreset = (presetId) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    savePresets(updatedPresets);
  };

  const toggleFavorite = (presetId) => {
    const updatedPresets = presets.map(p =>
      p.id === presetId ? { ...p, isFavorite: !p.isFavorite } : p
    );
    savePresets(updatedPresets);
  };

  const updatePreset = (presetId, updates) => {
    const updatedPresets = presets.map(p =>
      p.id === presetId ? { ...p, ...updates } : p
    );
    savePresets(updatedPresets);
  };

  return {
    presets,
    addPreset,
    deletePreset,
    toggleFavorite,
    updatePreset
  };
};