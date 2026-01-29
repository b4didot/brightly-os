/**
 * CommandArea Component
 * 
 * Top header spanning full width.
 * Contains Add button, filter dropdowns, and Brightly logo on the right.
 */

import { FilterDropdown } from './FilterDropdown';
import { CONTEXTS } from '../lib/items';

// Convert CONTEXTS to array format for dropdown
const categoryOptions = Object.values(CONTEXTS).map(context => ({
  id: context,
  name: context.charAt(0).toUpperCase() + context.slice(1),
}));

export function CommandArea({ 
  zones, 
  selectedZoneIds, 
  selectedCategoryIds,
  onZoneFilterChange,
  onCategoryFilterChange,
  onAddClick,
}) {
  return (
    <header className="command-area">
      {/* Left side: Add button and filters */}
      <nav className="command-area__menu">
        <button className="add-btn" onClick={onAddClick}>
          <span className="add-btn__icon">+</span>
          <span>Add</span>
        </button>

        <FilterDropdown
          label="Zones"
          options={zones.map(z => ({ id: z.id, name: z.name }))}
          selectedIds={selectedZoneIds}
          onChange={onZoneFilterChange}
        />

        <FilterDropdown
          label="Category"
          options={categoryOptions}
          selectedIds={selectedCategoryIds}
          onChange={onCategoryFilterChange}
        />
      </nav>

      {/* Logo on the right */}
      <div className="command-area__logo">
        Brightly
      </div>
    </header>
  );
}
