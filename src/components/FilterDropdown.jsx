/**
 * FilterDropdown Component
 * 
 * Multiselect dropdown for filtering items.
 * Used for zones and categories.
 */

import { useState, useRef, useEffect } from 'react';

export function FilterDropdown({ 
  label, 
  options, 
  selectedIds, 
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button 
        className={`filter-dropdown__trigger ${hasSelection ? 'filter-dropdown__trigger--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{label}</span>
        {hasSelection && (
          <span className="filter-dropdown__count">{selectedIds.length}</span>
        )}
        <span className="filter-dropdown__chevron">▼</span>
      </button>

      {isOpen && (
        <div className="filter-dropdown__menu">
          {options.length === 0 ? (
            <div className="filter-dropdown__option">
              <span className="filter-dropdown__label" style={{ color: 'var(--text-muted)' }}>
                No options available
              </span>
            </div>
          ) : (
            options.map(option => (
              <div 
                key={option.id} 
                className="filter-dropdown__option"
                onClick={() => toggleOption(option.id)}
              >
                <div className={`filter-dropdown__checkbox ${selectedIds.includes(option.id) ? 'filter-dropdown__checkbox--checked' : ''}`}>
                  {selectedIds.includes(option.id) && (
                    <span className="filter-dropdown__checkbox-icon">✓</span>
                  )}
                </div>
                <span className="filter-dropdown__label">{option.name}</span>
              </div>
            ))
          )}
          
          {hasSelection && (
            <div className="filter-dropdown__clear" onClick={clearAll}>
              Clear all
            </div>
          )}
        </div>
      )}
    </div>
  );
}
