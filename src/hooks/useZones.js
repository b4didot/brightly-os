/**
 * useZones Hook
 * 
 * Manages zones state for filtering.
 * Zones are filters only, never containers.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchZones, createZone, deleteZone } from '../lib/zones';

export function useZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // Load zones
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await fetchZones();

    if (fetchError) {
      setError(fetchError.message);
      setZones([]);
    } else {
      setZones(data || []);
    }

    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  /**
   * Select a zone for filtering
   * Pass null to clear filter
   */
  const selectZone = useCallback((zoneId) => {
    setSelectedZoneId(zoneId);
  }, []);

  /**
   * Add a new zone
   */
  const add = useCallback(async (name) => {
    const { data, error: createError } = await createZone(name);

    if (createError) {
      setError(createError.message);
      return null;
    }

    setZones(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  }, []);

  /**
   * Remove a zone (items remain, just unlinked)
   */
  const remove = useCallback(async (zoneId) => {
    const { error: deleteError } = await deleteZone(zoneId);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setZones(prev => prev.filter(z => z.id !== zoneId));
    
    // Clear selection if deleted zone was selected
    if (selectedZoneId === zoneId) {
      setSelectedZoneId(null);
    }

    return true;
  }, [selectedZoneId]);

  /**
   * Get zone by ID
   */
  const getZone = useCallback((id) => {
    return zones.find(z => z.id === id) || null;
  }, [zones]);

  return {
    zones,
    loading,
    error,
    selectedZoneId,
    selectedZone: getZone(selectedZoneId),

    // Actions
    reload: load,
    selectZone,
    add,
    remove,

    // Helpers
    getZone,
  };
}
