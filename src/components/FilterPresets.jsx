import React, { useState } from 'react';
import { Filter, Save, X, Star, StarOff } from 'lucide-react';

// ==================== COMPONENT 2: FilterPresets ====================
const FilterPresets = ({
  presets,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
  onToggleFavorite,
  currentCriteria
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }
    onSavePreset(presetName.trim(), currentCriteria);
    setPresetName('');
    setShowSaveModal(false);
  };

  const favoritePresets = presets.filter(p => p.isFavorite);
  const regularPresets = presets.filter(p => !p.isFavorite);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all"
        >
          <Filter className="w-4 h-4" />
          {showPresets ? 'Hide' : 'Show'} Saved Filters ({presets.length})
        </button>

        <button
          onClick={() => setShowSaveModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all"
        >
          <Save className="w-4 h-4" />
          Save Current Filter
        </button>
      </div>

      {showPresets && presets.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="space-y-2">
            {favoritePresets.length > 0 && (
              <>
                <div className="text-yellow-300 text-xs font-semibold mb-2 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Favorite Filters
                </div>
                {favoritePresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onLoad={onLoadPreset}
                    onDelete={onDeletePreset}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </>
            )}

            {regularPresets.length > 0 && (
              <>
                {favoritePresets.length > 0 && (
                  <div className="text-purple-300 text-xs font-semibold mb-2 mt-3">All Filters</div>
                )}
                {regularPresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onLoad={onLoadPreset}
                    onDelete={onDeletePreset}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Filter Preset
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-purple-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm font-medium mb-2 block">Preset Name</label>
                <input
                  type="text"
                  placeholder="e.g., High Amount Pending"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-purple-300"
                  autoFocus
                />
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-purple-200 text-xs font-semibold mb-2">Current Filters:</p>
                <div className="space-y-1 text-xs">
                  {Object.entries(currentCriteria).map(([key, value]) => {
                    if (value && value !== 'All') {
                      return (
                        <p key={key} className="text-white">
                          <span className="text-purple-300">{key}:</span> {value}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSavePreset}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold transition-all"
                >
                  Save Preset
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PresetCard = ({ preset, onLoad, onDelete, onToggleFavorite }) => {
  return (
    <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between hover:bg-white/15 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-white font-medium text-sm">{preset.name}</h4>
          {preset.isFavorite && (
            <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
          )}
        </div>
        <p className="text-purple-300 text-xs">
          {Object.keys(preset.criteria).filter(k => preset.criteria[k] && preset.criteria[k] !== 'All').length} filters active
        </p>
      </div>
      <div className="flex gap-1 ml-2">
        <button
          onClick={() => onToggleFavorite(preset.id)}
          className="text-purple-300 hover:text-yellow-400 transition-colors p-1"
          title={preset.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {preset.isFavorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onLoad(preset.criteria)}
          className="text-blue-400 hover:text-blue-300 transition-colors p-1"
          title="Load preset"
        >
          <Filter className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(preset.id)}
          className="text-red-400 hover:text-red-300 transition-colors p-1"
          title="Delete preset"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FilterPresets;