/**
 * Items Data Layer
 * 
 * Handles all CRUD operations for items with rule enforcement:
 * - Single current rule: only one item can have status "current" at a time
 * - Focus-based status model: waiting -> in_progress -> current -> done
 * - When current is replaced, previous current becomes top of in_progress list
 * - Priority ordering: maintains priority_order field for drag-and-drop
 */

import { supabase } from '../supabase';

// Focus-based statuses
export const STATUSES = {
  WAITING: 'waiting',       // Not yet ready to work on
  IN_PROGRESS: 'in_progress', // Queued and ready to work on
  CURRENT: 'current',       // The one thing you're focused on now (unique)
  DONE: 'done',             // Completed
};

// Valid contexts (locked, never change)
export const CONTEXTS = {
  OBJECTIVES: 'objectives',   // Active execution
  RESEARCH: 'research',       // Learning and discovery
  NEEDS: 'needs',             // Important but not urgent
  REMINDERS: 'reminders',     // Time-based nudges
};

/**
 * Fetch all items ordered by priority
 * @param {Object} options - Filter options
 * @param {boolean} options.includeDone - Include completed items (default: false)
 * @param {string} options.zoneId - Filter by zone (optional)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export async function fetchItems({ includeDone = false, zoneId = null } = {}) {
  let query = supabase
    .from('items')
    .select('*')
    .order('priority_order', { ascending: true });

  if (!includeDone) {
    query = query.neq('status', STATUSES.DONE);
  }

  if (zoneId) {
    query = query.eq('zone_id', zoneId);
  }

  return query;
}

/**
 * Fetch a single item by ID
 * @param {string} id 
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function fetchItem(id) {
  return supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();
}

/**
 * Set an item as current, enforcing single-current rule
 * When replacing current, the previous current becomes top of in_progress list
 * @param {string} id - Item ID to set as current
 * @returns {Promise<{data: Object, error: Object, previousCurrentId: string|null}>}
 */
export async function setItemCurrent(id) {
  // First, find any currently current item
  const { data: previousCurrent, error: findError } = await supabase
    .from('items')
    .select('id, priority_order')
    .eq('status', STATUSES.CURRENT)
    .maybeSingle();

  if (findError) {
    return { data: null, error: findError, previousCurrentId: null };
  }

  let previousCurrentId = null;

  // If there's a current item (and it's not the same one), move it to top of in_progress
  if (previousCurrent && previousCurrent.id !== id) {
    // Find the minimum priority_order among in_progress items
    const { data: topItem } = await supabase
      .from('items')
      .select('priority_order')
      .eq('status', STATUSES.IN_PROGRESS)
      .order('priority_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    // Set priority_order to be above the current top (or 1 if none exist)
    const newPriorityOrder = topItem ? topItem.priority_order - 1 : 1;

    const { error: demoteError } = await supabase
      .from('items')
      .update({ 
        status: STATUSES.IN_PROGRESS,
        priority_order: newPriorityOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', previousCurrent.id);

    if (demoteError) {
      return { data: null, error: demoteError, previousCurrentId: null };
    }
    previousCurrentId = previousCurrent.id;
  }

  // Now set the new item as current
  const { data, error } = await supabase
    .from('items')
    .update({ 
      status: STATUSES.CURRENT,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error, previousCurrentId };
}

/**
 * Set an item as waiting (not ready to work on)
 * @param {string} id 
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function setItemWaiting(id) {
  return supabase
    .from('items')
    .update({ 
      status: STATUSES.WAITING,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
}

/**
 * Set an item as in_progress (queued and ready)
 * @param {string} id 
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function setItemInProgress(id) {
  return supabase
    .from('items')
    .update({ 
      status: STATUSES.IN_PROGRESS,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
}

/**
 * Mark an item as done
 * @param {string} id 
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function setItemDone(id) {
  return supabase
    .from('items')
    .update({ 
      status: STATUSES.DONE,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
}

/**
 * Update item status with rule enforcement
 * @param {string} id 
 * @param {string} newStatus 
 * @returns {Promise<{data: Object, error: Object, previousCurrentId: string|null}>}
 */
export async function updateItemStatus(id, newStatus) {
  if (!Object.values(STATUSES).includes(newStatus)) {
    return { 
      data: null, 
      error: { message: `Invalid status: ${newStatus}` },
      previousCurrentId: null
    };
  }

  if (newStatus === STATUSES.CURRENT) {
    return setItemCurrent(id);
  }

  if (newStatus === STATUSES.DONE) {
    const result = await setItemDone(id);
    return { ...result, previousCurrentId: null };
  }

  if (newStatus === STATUSES.WAITING) {
    const result = await setItemWaiting(id);
    return { ...result, previousCurrentId: null };
  }

  const result = await setItemInProgress(id);
  return { ...result, previousCurrentId: null };
}

/**
 * Reorder items by updating priority_order
 * Called after drag-and-drop to persist new order
 * @param {Array<{id: string, priority_order: number}>} orderUpdates 
 * @returns {Promise<{success: boolean, error: Object}>}
 */
export async function reorderItems(orderUpdates) {
  // Use a transaction-like approach: update all items
  const updates = orderUpdates.map(({ id, priority_order }) => 
    supabase
      .from('items')
      .update({ 
        priority_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
  );

  try {
    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      return { success: false, error: errors[0].error };
    }
    
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: { message: err.message } };
  }
}

/**
 * Create a new item
 * @param {Object} item 
 * @param {string} item.title - Required
 * @param {string} item.context - Required, one of CONTEXTS
 * @param {string} item.ref_code - Optional, auto-generated if not provided
 * @param {string} item.notes - Optional
 * @param {string} item.zone_id - Optional
 * @param {string} item.due_date - Optional
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function createItem(item) {
  if (!item.title || !item.context) {
    return { 
      data: null, 
      error: { message: 'title and context are required' } 
    };
  }

  if (!Object.values(CONTEXTS).includes(item.context)) {
    return { 
      data: null, 
      error: { message: `Invalid context: ${item.context}` } 
    };
  }

  // Get the max priority_order to append at end
  const { data: maxItem } = await supabase
    .from('items')
    .select('priority_order')
    .order('priority_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxItem?.priority_order ?? 0) + 1;

  const newItem = {
    title: item.title,
    context: item.context,
    ref_code: item.ref_code || generateRefCode(item.context),
    notes: item.notes || null,
    zone_id: item.zone_id || null,
    due_date: item.due_date || null,
    status: STATUSES.WAITING, // New items start as waiting
    priority_order: nextOrder,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return supabase
    .from('items')
    .insert(newItem)
    .select()
    .single();
}

/**
 * Update item fields (not status - use updateItemStatus for that)
 * @param {string} id 
 * @param {Object} updates - Fields to update (title, notes, zone_id, due_date)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function updateItem(id, updates) {
  // Only allow safe field updates
  const safeFields = ['title', 'notes', 'zone_id', 'due_date'];
  const safeUpdates = {};
  
  for (const field of safeFields) {
    if (updates[field] !== undefined) {
      safeUpdates[field] = updates[field];
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return { data: null, error: { message: 'No valid fields to update' } };
  }

  safeUpdates.updated_at = new Date().toISOString();

  return supabase
    .from('items')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single();
}

/**
 * Generate a ref_code based on context
 * Format: CTX-XXXXX (e.g., OBJ-A3F2K)
 */
function generateRefCode(context) {
  const prefixes = {
    [CONTEXTS.OBJECTIVES]: 'OBJ',
    [CONTEXTS.RESEARCH]: 'RES',
    [CONTEXTS.NEEDS]: 'NED',
    [CONTEXTS.REMINDERS]: 'REM',
  };
  const prefix = prefixes[context] || 'ITM';
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${suffix}`;
}
