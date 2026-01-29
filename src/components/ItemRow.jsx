/**
 * ItemRow Component
 * 
 * Displays a single item in the Command Table.
 * Provides status controls and click handler for opening drawer.
 * 
 * Focus states: waiting -> in_progress -> current -> done
 * 
 * TODO: Style with Tailwind
 * TODO: Add drag handle for reordering
 * TODO: Add visual indicators for current/done states
 */

import { STATUSES } from '../lib/items';

export function ItemRow({ item, onStatusChange, onClick, isCurrent }) {
  const handleStatusClick = (e, newStatus) => {
    e.stopPropagation(); // Don't trigger row click
    onStatusChange(item.id, newStatus);
  };

  // TODO: Replace with styled components
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    border: '1px solid #ddd',
    marginBottom: '4px',
    cursor: 'pointer',
    background: isCurrent ? '#e8f4ff' : 'white',
    opacity: item.status === STATUSES.DONE ? 0.5 : 1,
  };

  return (
    <div style={rowStyle} onClick={() => onClick(item)}>
      {/* Status Controls */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {/* Set as Current (focus) - available for waiting and in_progress */}
        {(item.status === STATUSES.WAITING || item.status === STATUSES.IN_PROGRESS) && (
          <button
            onClick={(e) => handleStatusClick(e, STATUSES.CURRENT)}
            title="Set as Current Focus"
          >
            ▶
          </button>
        )}
        
        {/* Pause (move to in_progress) - available for current */}
        {item.status === STATUSES.CURRENT && (
          <button
            onClick={(e) => handleStatusClick(e, STATUSES.IN_PROGRESS)}
            title="Pause (move to in progress)"
          >
            ⏸
          </button>
        )}

        {/* Move to in_progress - available for waiting */}
        {item.status === STATUSES.WAITING && (
          <button
            onClick={(e) => handleStatusClick(e, STATUSES.IN_PROGRESS)}
            title="Move to In Progress"
          >
            ↑
          </button>
        )}

        {/* Move to waiting - available for in_progress */}
        {item.status === STATUSES.IN_PROGRESS && (
          <button
            onClick={(e) => handleStatusClick(e, STATUSES.WAITING)}
            title="Move to Waiting"
          >
            ↓
          </button>
        )}

        {/* Complete - available for all non-done */}
        {item.status !== STATUSES.DONE && (
          <button
            onClick={(e) => handleStatusClick(e, STATUSES.DONE)}
            title="Complete"
          >
            ✓
          </button>
        )}
      </div>

      {/* Ref Code */}
      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
        {item.ref_code}
      </span>

      {/* Title */}
      <span style={{ flex: 1 }}>
        {item.title}
      </span>

      {/* Context Badge */}
      <span style={{ 
        fontSize: '11px', 
        padding: '2px 6px', 
        background: '#f0f0f0',
        borderRadius: '3px'
      }}>
        {item.context}
      </span>

      {/* Status Badge */}
      <span style={{ 
        fontSize: '11px', 
        padding: '2px 6px',
        background: item.status === STATUSES.CURRENT ? '#4caf50' : '#e0e0e0',
        color: item.status === STATUSES.CURRENT ? 'white' : '#666',
        borderRadius: '3px'
      }}>
        {item.status}
      </span>

      {/* TODO: Drag handle */}
      <span style={{ cursor: 'grab', color: '#aaa' }}>⋮⋮</span>
    </div>
  );
}
