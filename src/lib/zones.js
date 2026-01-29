/**
 * Zones Data Layer
 * 
 * Zones are filters only, never containers.
 * Removing a zone never removes the item.
 */

import { supabase } from '../supabase';

/**
 * Fetch all zones
 * @returns {Promise<{data: Array, error: Object}>}
 */
export async function fetchZones() {
  return supabase
    .from('zones')
    .select('*')
    .order('name', { ascending: true });
}

/**
 * Create a new zone
 * @param {string} name 
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function createZone(name) {
  if (!name || !name.trim()) {
    return { data: null, error: { message: 'Zone name is required' } };
  }

  return supabase
    .from('zones')
    .insert({ 
      name: name.trim(),
      created_at: new Date().toISOString()
    })
    .select()
    .single();
}

/**
 * Delete a zone
 * Note: This does NOT delete items in the zone - they remain with zone_id = null
 * @param {string} id 
 * @returns {Promise<{success: boolean, error: Object}>}
 */
export async function deleteZone(id) {
  // First, clear zone_id from all items in this zone
  const { error: clearError } = await supabase
    .from('items')
    .update({ zone_id: null, updated_at: new Date().toISOString() })
    .eq('zone_id', id);

  if (clearError) {
    return { success: false, error: clearError };
  }

  // Then delete the zone
  const { error } = await supabase
    .from('zones')
    .delete()
    .eq('id', id);

  return { success: !error, error };
}
