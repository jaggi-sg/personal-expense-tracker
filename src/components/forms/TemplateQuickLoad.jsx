// src/components/TemplateQuickLoad.jsx

import React, { useState } from 'react';
import { FileText, Star, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const TemplateQuickLoad = ({
  templates = [],
  onLoadTemplate,
  onDeleteTemplate,
  onToggleFavorite,
  expenseType
}) => {
  const [showAll, setShowAll] = useState(false);

  // Filter templates by expense type
  const filteredTemplates = templates.filter(t => t.type === expenseType);

  // Sort: favorites first, then by name
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return a.name.localeCompare(b.name);
  });

  const favoriteTemplates = sortedTemplates.filter(t => t.isFavorite);
  // AFTER (fixed):
  const displayTemplates = showAll
    ? sortedTemplates
    : (favoriteTemplates.length > 0 ? favoriteTemplates.slice(0, 3) : sortedTemplates.slice(0, 3));

  if (filteredTemplates.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-purple-300 text-sm text-center">
          No templates saved yet. Fill out the form and click "Save as Template"
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="text-white font-semibold text-sm">Quick Load Templates</span>
          <span className="text-purple-300 text-xs">({filteredTemplates.length})</span>
        </div>
        {filteredTemplates.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
          >
            {showAll ? 'Show Less' : `Show All (${filteredTemplates.length})`}
            {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {displayTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white/10 rounded-lg p-3 hover:bg-white/15 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  {template.isFavorite && (
                    <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                  )}
                  <h4 className="text-white font-medium text-sm truncate">
                    {template.name}
                  </h4>
                </div>
                <p className="text-purple-300 text-xs truncate">
                  {template.category}
                </p>
                {template.amount > 0 && (
                  <p className="text-green-300 text-xs font-semibold mt-1">
                    ${template.amount.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleFavorite(template.id)}
                  className="text-purple-300 hover:text-yellow-400 transition-colors p-1"
                  title={template.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={`w-3 h-3 ${template.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete template "${template.name}"?`)) {
                      onDeleteTemplate(template.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                  title="Delete template"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <button
              onClick={() => onLoadTemplate(template)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1.5 text-xs font-semibold transition-all"
            >
              Load Template
            </button>
          </div>
        ))}
      </div>

      {!showAll && filteredTemplates.length > 3 && (
        <div className="text-center mt-3">
          <button
            onClick={() => setShowAll(true)}
            className="text-blue-400 hover:text-blue-300 text-xs font-medium"
          >
            + {filteredTemplates.length - 3} more templates
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateQuickLoad;