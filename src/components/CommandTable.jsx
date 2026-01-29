/**
 * CommandTable Component (Stage 1)
 * 
 * The canonical list of all items. Items never leave this list.
 * All state is reflected here.
 * 
 * Features:
 * - Display all items ordered by priority_order
 * - Zone filtering (filters only, never containers)
 * - Status transitions with single-current rule
 * - Click to open context drawer (Stage 2)
 * 
 * Focus states: waiting -> in_progress -> current -> done
 * 
 * TODO: Implement drag-and-drop reordering
 * TODO: Style with Tailwind
 * TODO: Add zone filter dropdown
 * TODO: Add "show done" toggle
 */

import { ItemRow } from './ItemRow';
import { STATUSES } from '../lib/items';

export function CommandTable({ 
  items, 
  loading, 
  error,
  zones,
  selectedZoneId,
  onZoneSelect,
  onStatusChange,
  onItemClick,
  onReorder,
  showDone,
  onToggleShowDone,
}) {
  // Filter items by zone if selected
  const filteredItems = selectedZoneId
    ? items.filter(item => item.zone_id === selectedZoneId)
    : items;

  // Separate current item for visual prominence
  const currentItem = filteredItems.find(item => item.status === STATUSES.CURRENT);
  const otherItems = filteredItems.filter(item => item.id !== currentItem?.id);

  // TODO: Implement actual drag-and-drop
  // For now, this is a placeholder that simulates the reorder API
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const newOrder = [...filteredItems];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorder(newOrder);
  };

  const handleMoveDown = (index) => {
    if (index >= filteredItems.length - 1) return;
    const newOrder = [...filteredItems];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorder(newOrder);
  };

  if (loading) {
    return <div>Loading items...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      {/* Zone Filter - TODO: Style as dropdown */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span>Zone:</span>
        <select 
          value={selectedZoneId || ''} 
          onChange={(e) => onZoneSelect(e.target.value || null)}
        >
          <option value="">All Zones</option>
          {zones.map(zone => (
            <option key={zone.id} value={zone.id}>{zone.name}</option>
          ))}
        </select>

        <label style={{ marginLeft: 'auto' }}>
          <input 
            type="checkbox" 
            checked={showDone} 
            onChange={(e) => onToggleShowDone(e.target.checked)}
          />
          Show completed
        </label>
      </div>

      {/* Current Item Highlight - TODO: Style prominently */}
      {currentItem && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            CURRENT FOCUS
          </div>
          <ItemRow
            item={currentItem}
            isCurrent={true}
            onStatusChange={onStatusChange}
            onClick={onItemClick}
          />
        </div>
      )}

      {/* Item List */}
      <div>
        {otherItems.length === 0 && !currentItem && (
          <div style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
            No items found.
          </div>
        )}
        
        {otherItems.map((item, index) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center' }}>
            <ItemRow
              item={item}
              isCurrent={false}
              onStatusChange={onStatusChange}
              onClick={onItemClick}
            />
            {/* TODO: Replace with drag-and-drop */}
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '4px' }}>
              <button 
                onClick={() => handleMoveUp(index + (currentItem ? 1 : 0))}
                style={{ fontSize: '10px', padding: '2px' }}
              >
                ↑
              </button>
              <button 
                onClick={() => handleMoveDown(index + (currentItem ? 1 : 0))}
                style={{ fontSize: '10px', padding: '2px' }}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
