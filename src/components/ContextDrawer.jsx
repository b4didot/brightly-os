/**
 * ContextDrawer Component (Stage 2)
 * 
 * Opens when clicking an item. Shows a deeper view based on context.
 * Items never move between stages - Stage 2 is only a deeper view.
 * 
 * Contexts are locked:
 * - objectives: Active execution
 * - research: Learning and discovery
 * - needs: Important but not urgent
 * - reminders: Time-based nudges
 * 
 * TODO: Style as slide-out drawer
 * TODO: Add context-specific fields and behaviors
 * TODO: Add notes editing
 * TODO: Add due date picker for reminders
 */

import { CONTEXTS, STATUSES } from '../lib/items';

export function ContextDrawer({ item, zones, onClose, onUpdate, onStatusChange }) {
  if (!item) return null;

  const handleFieldChange = (field, value) => {
    onUpdate(item.id, { [field]: value });
  };

  // Context-specific content
  const renderContextContent = () => {
    switch (item.context) {
      case CONTEXTS.OBJECTIVES:
        return <ObjectivesView item={item} />;
      case CONTEXTS.RESEARCH:
        return <ResearchView item={item} />;
      case CONTEXTS.NEEDS:
        return <NeedsView item={item} />;
      case CONTEXTS.REMINDERS:
        return <RemindersView item={item} onUpdate={handleFieldChange} />;
      default:
        return <div>Unknown context: {item.context}</div>;
    }
  };

  // TODO: Style as proper drawer overlay
  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '400px',
    height: '100vh',
    background: 'white',
    borderLeft: '1px solid #ddd',
    padding: '24px',
    overflowY: 'auto',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.3)',
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={drawerStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'monospace', color: '#666' }}>{item.ref_code}</span>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Title */}
        <h2 style={{ margin: '0 0 8px 0' }}>{item.title}</h2>

        {/* Context Badge */}
        <div style={{ 
          display: 'inline-block',
          fontSize: '12px', 
          padding: '4px 8px', 
          background: '#f0f0f0',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {item.context}
        </div>

        {/* Status Controls */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Set as Current - available for waiting and in_progress */}
          {(item.status === STATUSES.WAITING || item.status === STATUSES.IN_PROGRESS) && (
            <button onClick={() => onStatusChange(item.id, STATUSES.CURRENT)}>
              Set as Current
            </button>
          )}
          
          {/* Pause (move to in_progress) - available for current */}
          {item.status === STATUSES.CURRENT && (
            <button onClick={() => onStatusChange(item.id, STATUSES.IN_PROGRESS)}>
              Pause
            </button>
          )}

          {/* Move to in_progress - available for waiting */}
          {item.status === STATUSES.WAITING && (
            <button onClick={() => onStatusChange(item.id, STATUSES.IN_PROGRESS)}>
              Move to In Progress
            </button>
          )}

          {/* Move to waiting - available for in_progress */}
          {item.status === STATUSES.IN_PROGRESS && (
            <button onClick={() => onStatusChange(item.id, STATUSES.WAITING)}>
              Move to Waiting
            </button>
          )}

          {/* Complete - available for all non-done */}
          {item.status !== STATUSES.DONE && (
            <button onClick={() => onStatusChange(item.id, STATUSES.DONE)}>
              Mark Done
            </button>
          )}
          
          <span style={{ 
            marginLeft: 'auto',
            padding: '4px 8px',
            background: item.status === STATUSES.CURRENT ? '#4caf50' : '#e0e0e0',
            color: item.status === STATUSES.CURRENT ? 'white' : '#666',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {item.status}
          </span>
        </div>

        {/* Zone Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Zone
          </label>
          <select 
            value={item.zone_id || ''} 
            onChange={(e) => handleFieldChange('zone_id', e.target.value || null)}
          >
            <option value="">No Zone</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Notes
          </label>
          <textarea
            value={item.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            style={{ width: '100%', minHeight: '100px', padding: '8px' }}
            placeholder="Add notes..."
          />
        </div>

        {/* Context-specific content */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
          {renderContextContent()}
        </div>

        {/* Metadata */}
        <div style={{ 
          marginTop: '20px', 
          paddingTop: '20px', 
          borderTop: '1px solid #eee',
          fontSize: '11px',
          color: '#999'
        }}>
          <div>Created: {new Date(item.created_at).toLocaleString()}</div>
          <div>Updated: {new Date(item.updated_at).toLocaleString()}</div>
          {item.completed_at && (
            <div>Completed: {new Date(item.completed_at).toLocaleString()}</div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Context-specific views
 * TODO: Implement context-specific behaviors
 */

function ObjectivesView({ item }) {
  return (
    <div>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
        Objectives Context
      </h4>
      <p style={{ fontSize: '13px', color: '#888' }}>
        Active execution. This is work you are currently doing or about to do.
      </p>
      {/* TODO: Add objective-specific fields like subtasks, milestones */}
    </div>
  );
}

function ResearchView({ item }) {
  return (
    <div>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
        Research Context
      </h4>
      <p style={{ fontSize: '13px', color: '#888' }}>
        Learning and discovery. Use this for things you're exploring or studying.
      </p>
      {/* TODO: Add research-specific fields like sources, findings */}
    </div>
  );
}

function NeedsView({ item }) {
  return (
    <div>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
        Needs Context
      </h4>
      <p style={{ fontSize: '13px', color: '#888' }}>
        Important but not urgent. These are things that need attention but aren't time-sensitive.
      </p>
      {/* TODO: Add needs-specific fields */}
    </div>
  );
}

function RemindersView({ item, onUpdate }) {
  return (
    <div>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
        Reminders Context
      </h4>
      <p style={{ fontSize: '13px', color: '#888' }}>
        Time-based nudges. Set a due date to be reminded.
      </p>
      
      {/* Due Date */}
      <div style={{ marginTop: '12px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          Due Date
        </label>
        <input
          type="date"
          value={item.due_date?.split('T')[0] || ''}
          onChange={(e) => onUpdate('due_date', e.target.value || null)}
        />
      </div>
      
      {/* TODO: Add reminder-specific fields like repeat, notification time */}
    </div>
  );
}
