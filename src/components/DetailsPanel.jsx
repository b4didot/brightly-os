/**
 * DetailsPanel Component
 * 
 * Right side of the app showing full details of selected item.
 * Includes status controls, notes, zone selection, and metadata.
 */

import { STATUSES, CONTEXTS } from '../lib/items';

export function DetailsPanel({ 
  item, 
  zones, 
  onUpdate, 
  onStatusChange,
}) {
  if (!item) {
    return (
      <div className="details-panel details-panel--empty">
        Select an item to view details
      </div>
    );
  }

  const handleFieldChange = (field, value) => {
    onUpdate(item.id, { [field]: value });
  };

  // Get context display info
  const contextInfo = {
    [CONTEXTS.OBJECTIVES]: 'Active execution work',
    [CONTEXTS.RESEARCH]: 'Learning and discovery',
    [CONTEXTS.NEEDS]: 'Important but not urgent',
    [CONTEXTS.REMINDERS]: 'Time-based nudges',
  };

  return (
    <div className="details-panel">
      {/* Header */}
      <div className="details-panel__header">
        <div className="details-panel__ref">{item.ref_code}</div>
        <h1 className="details-panel__title">{item.title}</h1>
        <div className="details-panel__context">{item.context}</div>
      </div>

      {/* Status */}
      <div className="details-panel__section">
        <div className="details-panel__label">Status</div>
        <div className="details-panel__status">
          {item.status === STATUSES.WAITING && (
            <>
              <button 
                className="status-btn"
                onClick={() => onStatusChange(item.id, STATUSES.IN_PROGRESS)}
              >
                Move to In Progress
              </button>
              <button 
                className="status-btn"
                onClick={() => onStatusChange(item.id, STATUSES.CURRENT)}
              >
                Set as Current
              </button>
            </>
          )}
          {item.status === STATUSES.IN_PROGRESS && (
            <>
              <button 
                className="status-btn"
                onClick={() => onStatusChange(item.id, STATUSES.WAITING)}
              >
                Move to Waiting
              </button>
              <button 
                className="status-btn"
                onClick={() => onStatusChange(item.id, STATUSES.CURRENT)}
              >
                Set as Current
              </button>
            </>
          )}
          {item.status === STATUSES.CURRENT && (
            <button 
              className="status-btn"
              onClick={() => onStatusChange(item.id, STATUSES.IN_PROGRESS)}
            >
              Pause
            </button>
          )}
          {item.status !== STATUSES.DONE && (
            <button 
              className="status-btn"
              onClick={() => onStatusChange(item.id, STATUSES.DONE)}
            >
              Mark Done
            </button>
          )}
          <button className="status-btn status-btn--active">
            {item.status}
          </button>
        </div>
      </div>

      {/* Zone */}
      <div className="details-panel__section">
        <div className="details-panel__label">Zone</div>
        <select 
          className="details-panel__select"
          value={item.zone_id || ''} 
          onChange={(e) => handleFieldChange('zone_id', e.target.value || null)}
        >
          <option value="">No Zone</option>
          {zones.map(zone => (
            <option key={zone.id} value={zone.id}>{zone.name}</option>
          ))}
        </select>
      </div>

      {/* Due Date (for reminders) */}
      {item.context === CONTEXTS.REMINDERS && (
        <div className="details-panel__section">
          <div className="details-panel__label">Due Date</div>
          <input
            type="date"
            className="details-panel__select"
            value={item.due_date?.split('T')[0] || ''}
            onChange={(e) => handleFieldChange('due_date', e.target.value || null)}
          />
        </div>
      )}

      {/* Notes */}
      <div className="details-panel__section">
        <div className="details-panel__label">Notes</div>
        <textarea
          className="details-panel__notes"
          value={item.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Add notes..."
        />
      </div>

      {/* Context Info */}
      <div className="details-panel__section">
        <div className="details-panel__label">About this context</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {contextInfo[item.context]}
        </p>
      </div>

      {/* Metadata */}
      <div className="details-panel__meta">
        <div className="details-panel__meta-item">
          Created: {new Date(item.created_at).toLocaleString()}
        </div>
        <div className="details-panel__meta-item">
          Updated: {new Date(item.updated_at).toLocaleString()}
        </div>
        {item.completed_at && (
          <div className="details-panel__meta-item">
            Completed: {new Date(item.completed_at).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
