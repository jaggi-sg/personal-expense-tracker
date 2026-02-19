// src/components/TemplateManager.jsx - FIXED VERSION

import React, { useState } from 'react';
import { FileText, Trash2, X, Star, StarOff } from 'lucide-react';

const TemplateManager = ({
  templates = [], // ← Default to empty array
  onLoadTemplate,
  onDeleteTemplate,
  onToggleFavorite,
  type = 'Recurring'
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Safety check - return null if templates is not an array
  if (!templates || !Array.isArray(templates)) {
    console.warn('TemplateManager: templates prop is not an array', templates);
    return null;
  }

  // Safety check - return null if required functions are missing
  if (!onLoadTemplate || !onDeleteTemplate || !onToggleFavorite) {
    console.warn('TemplateManager: missing required handler props');
    return null;
  }

  const filteredTemplates = templates
    .filter(t => t.type === type)
    .filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });

  const favoriteTemplates = filteredTemplates.filter(t => t.isFavorite);
  const regularTemplates = filteredTemplates.filter(t => !t.isFavorite);
  const templateCount = templates.filter(t => t.type === type).length;

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowTemplates(!showTemplates)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all"
      >
        <FileText className="w-4 h-4" />
        {showTemplates ? 'Hide Templates' : `Load Template (${templateCount})`}
      </button>

      {showTemplates && (
        <div className="mt-3 bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Quick Load Templates</h3>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {templateCount > 3 && (
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-300 mb-3"
            />
          )}

          {filteredTemplates.length === 0 ? (
            <p className="text-purple-300 text-sm text-center py-4">
              {searchQuery ? 'No templates found matching your search' : 'No templates saved yet'}
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {favoriteTemplates.length > 0 && (
                <>
                  <div className="text-yellow-300 text-xs font-semibold mb-2 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Favorites
                  </div>
                  {favoriteTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onLoad={onLoadTemplate}
                      onDelete={onDeleteTemplate}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </>
              )}

              {regularTemplates.length > 0 && favoriteTemplates.length > 0 && (
                <div className="text-purple-300 text-xs font-semibold mb-2 mt-4">
                  All Templates
                </div>
              )}

              {regularTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onLoad={onLoadTemplate}
                  onDelete={onDeleteTemplate}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TemplateCard = ({ template, onLoad, onDelete, onToggleFavorite }) => {
  return (
    <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between hover:bg-white/15 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-white font-medium text-sm truncate">{template.name}</h4>
          {template.isFavorite && (
            <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
          )}
        </div>
        <p className="text-purple-300 text-xs mt-1">
          {template.category} • {template.description}
        </p>
        {template.amount > 0 && (
          <p className="text-green-300 text-xs font-semibold mt-1">
            ${template.amount.toFixed(2)}
          </p>
        )}
      </div>
      <div className="flex gap-1 ml-2">
        <button
          onClick={() => onToggleFavorite(template.id)}
          className="text-purple-300 hover:text-yellow-400 transition-colors p-1"
          title={template.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {template.isFavorite ? (
            <StarOff className="w-4 h-4" />
          ) : (
            <Star className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => onLoad(template)}
          className="text-blue-400 hover:text-blue-300 transition-colors p-1"
          title="Load template"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(template.id)}
          className="text-red-400 hover:text-red-300 transition-colors p-1"
          title="Delete template"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TemplateManager;