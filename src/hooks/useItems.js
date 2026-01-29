/**
 * useItems Hook
 * 
 * Manages items state with loading, mutations, and optimistic updates.
 * Enforces business rules through the data layer.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchItems,
  updateItemStatus,
  reorderItems,
  createItem,
  updateItem,
  STATUSES,
} from '../lib/items';

export function useItems({ includeDone = false, zoneId = null } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load items
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await fetchItems({ includeDone, zoneId });

    if (fetchError) {
      setError(fetchError.message);
      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }, [includeDone, zoneId]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  /**
   * Change item status with optimistic update
   * Enforces single-current rule: when setting current, previous current goes to top of in_progress
   */
  const changeStatus = useCallback(async (id, newStatus) => {
    // Optimistic update
    setItems(prev => {
      let updated = [...prev];
      
      // If setting current, move previous current to top of in_progress
      if (newStatus === STATUSES.CURRENT) {
        const previousCurrent = updated.find(item => item.status === STATUSES.CURRENT);
        if (previousCurrent && previousCurrent.id !== id) {
          // Find minimum priority_order among in_progress items
          const inProgressItems = updated.filter(item => item.status === STATUSES.IN_PROGRESS);
          const minOrder = inProgressItems.length > 0 
            ? Math.min(...inProgressItems.map(i => i.priority_order)) 
            : 1;
          
          updated = updated.map(item => 
            item.id === previousCurrent.id 
              ? { ...item, status: STATUSES.IN_PROGRESS, priority_order: minOrder - 1 }
              : item
          );
        }
      }

      // Update the target item
      return updated.map(item =>
        item.id === id 
          ? { 
              ...item, 
              status: newStatus,
              completed_at: newStatus === STATUSES.DONE ? new Date().toISOString() : item.completed_at
            }
          : item
      );
    });

    // Persist
    const { error: updateError } = await updateItemStatus(id, newStatus);

    if (updateError) {
      // Revert on error
      setError(updateError.message);
      await load();
    }
  }, [load]);

  /**
   * Reorder items after drag-and-drop
   * @param {Array} newOrder - Array of items in new order
   */
  const reorder = useCallback(async (newOrder) => {
    // Optimistic update with new priority_order values
    const updatedItems = newOrder.map((item, index) => ({
      ...item,
      priority_order: index + 1,
    }));

    setItems(updatedItems);

    // Persist
    const orderUpdates = updatedItems.map(item => ({
      id: item.id,
      priority_order: item.priority_order,
    }));

    const { error: reorderError } = await reorderItems(orderUpdates);

    if (reorderError) {
      setError(reorderError.message);
      await load();
    }
  }, [load]);

  /**
   * Add a new item
   */
  const add = useCallback(async (itemData) => {
    const { data, error: createError } = await createItem(itemData);

    if (createError) {
      setError(createError.message);
      return null;
    }

    // Add to state
    setItems(prev => [...prev, data]);
    return data;
  }, []);

  /**
   * Update item fields
   */
  const update = useCallback(async (id, updates) => {
    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));

    const { data, error: updateError } = await updateItem(id, updates);

    if (updateError) {
      setError(updateError.message);
      await load();
      return null;
    }

    return data;
  }, [load]);

  /**
   * Get the current focus item (if any)
   */
  const currentItem = items.find(item => item.status === STATUSES.CURRENT) || null;

  /**
   * Filter items by context
   */
  const getByContext = useCallback((context) => {
    return items.filter(item => item.context === context);
  }, [items]);

  return {
    items,
    loading,
    error,
    currentItem,
    
    // Actions
    reload: load,
    changeStatus,
    reorder,
    add,
    update,
    
    // Helpers
    getByContext,
  };
}
