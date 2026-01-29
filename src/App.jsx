/**
 * Brightly OS - App Root
 * 
 * Personal work operating system with three-area layout:
 * - Command Area: Header with menu and logo
 * - Item Board: Waiting and In Progress boards with Current box
 * - Details Panel: Full item details
 */

import { useState, useCallback, useMemo } from 'react';
import { useItems } from './hooks/useItems';
import { useZones } from './hooks/useZones';
import { CommandArea } from './components/CommandArea';
import { ItemBoard } from './components/ItemBoard';
import { DetailsPanel } from './components/DetailsPanel';

export default function App() {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedZoneIds, setSelectedZoneIds] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Zones state
  const { zones, loading: zonesLoading } = useZones();

  // Items state (excluding done by default)
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    changeStatus,
    update,
    add,
    reload,
  } = useItems({ includeDone: false });

  // Filter items based on selected zones and categories
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Zone filter (if any zones selected)
      if (selectedZoneIds.length > 0) {
        if (!item.zone_id || !selectedZoneIds.includes(item.zone_id)) {
          return false;
        }
      }
      
      // Category filter (if any categories selected)
      if (selectedCategoryIds.length > 0) {
        if (!selectedCategoryIds.includes(item.context)) {
          return false;
        }
      }
      
      return true;
    });
  }, [items, selectedZoneIds, selectedCategoryIds]);

  // Find selected item from current items
  const selectedItem = items.find(item => item.id === selectedItemId) || null;

  // Handle item click
  const handleItemClick = useCallback((item) => {
    setSelectedItemId(item.id);
  }, []);

  // Handle status change
  const handleStatusChange = useCallback(async (id, newStatus) => {
    await changeStatus(id, newStatus);
  }, [changeStatus]);

  // Handle item update from details panel
  const handleItemUpdate = useCallback(async (id, updates) => {
    await update(id, updates);
  }, [update]);

  // Handle add button click
  const handleAddClick = useCallback(() => {
    setShowAddModal(true);
  }, []);

  // Handle add item
  const handleAddItem = useCallback(async (itemData) => {
    const newItem = await add(itemData);
    if (newItem) {
      setShowAddModal(false);
      setSelectedItemId(newItem.id);
    }
  }, [add]);

  // Loading state
  if (itemsLoading || zonesLoading) {
    return (
      <div className="app-layout">
        <CommandArea 
          zones={[]}
          selectedZoneIds={[]}
          selectedCategoryIds={[]}
          onZoneFilterChange={() => {}}
          onCategoryFilterChange={() => {}}
          onAddClick={() => {}}
        />
        <div className="item-board-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Loading...
        </div>
        <div className="details-panel details-panel--empty">
          Loading...
        </div>
      </div>
    );
  }

  // Error state
  if (itemsError) {
    return (
      <div className="app-layout">
        <CommandArea 
          zones={zones}
          selectedZoneIds={selectedZoneIds}
          selectedCategoryIds={selectedCategoryIds}
          onZoneFilterChange={setSelectedZoneIds}
          onCategoryFilterChange={setSelectedCategoryIds}
          onAddClick={handleAddClick}
        />
        <div className="item-board-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
          Error: {itemsError}
        </div>
        <div className="details-panel details-panel--empty">
          Error loading data
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <CommandArea 
        zones={zones}
        selectedZoneIds={selectedZoneIds}
        selectedCategoryIds={selectedCategoryIds}
        onZoneFilterChange={setSelectedZoneIds}
        onCategoryFilterChange={setSelectedCategoryIds}
        onAddClick={handleAddClick}
      />
      
      <ItemBoard
        items={filteredItems}
        zones={zones}
        selectedItemId={selectedItemId}
        onItemClick={handleItemClick}
        onStatusChange={handleStatusChange}
      />

      <DetailsPanel
        item={selectedItem}
        zones={zones}
        onUpdate={handleItemUpdate}
        onStatusChange={handleStatusChange}
      />

      {/* Add Modal */}
      {showAddModal && (
        <AddItemModal
          zones={zones}
          onAdd={handleAddItem}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

/**
 * AddItemModal Component
 * 
 * Simple modal for adding new items.
 */
import { CONTEXTS } from './lib/items';

function AddItemModal({ zones, onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState(CONTEXTS.OBJECTIVES);
  const [zoneId, setZoneId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    await onAdd({ 
      title: title.trim(), 
      context,
      zone_id: zoneId || null,
    });
    setSubmitting(false);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Add Item</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label">Title</label>
            <input
              type="text"
              className="modal__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="modal__field">
            <label className="modal__label">Category</label>
            <select 
              className="modal__select"
              value={context} 
              onChange={(e) => setContext(e.target.value)}
              disabled={submitting}
            >
              <option value={CONTEXTS.OBJECTIVES}>Objectives</option>
              <option value={CONTEXTS.RESEARCH}>Research</option>
              <option value={CONTEXTS.NEEDS}>Needs</option>
              <option value={CONTEXTS.REMINDERS}>Reminders</option>
            </select>
          </div>

          <div className="modal__field">
            <label className="modal__label">Zone (optional)</label>
            <select 
              className="modal__select"
              value={zoneId} 
              onChange={(e) => setZoneId(e.target.value)}
              disabled={submitting}
            >
              <option value="">No Zone</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>

          <div className="modal__actions">
            <button 
              type="button" 
              className="modal__btn modal__btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal__btn modal__btn--primary"
              disabled={submitting || !title.trim()}
            >
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
