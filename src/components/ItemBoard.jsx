/**
 * ItemBoard Component
 * 
 * Left side of the app containing:
 * - Waiting board (top)
 * - In Progress board (bottom) with Current box at top
 * 
 * Supports drag-and-drop between boards and into Current.
 */

import { useState } from 'react';
import { ItemCard } from './ItemCard';
import { STATUSES } from '../lib/items';

export function ItemBoard({ 
  items, 
  zones,
  selectedItemId,
  onItemClick, 
  onStatusChange,
}) {
  const [dragOverTarget, setDragOverTarget] = useState(null);

  // Separate items by status
  const currentItem = items.find(item => item.status === STATUSES.CURRENT);
  const waitingItems = items.filter(item => item.status === STATUSES.WAITING);
  const inProgressItems = items.filter(item => item.status === STATUSES.IN_PROGRESS);

  // Enrich items with zone names
  const enrichWithZone = (item) => ({
    ...item,
    zone_name: item.zone_id ? zones.find(z => z.id === item.zone_id)?.name : null,
  });

  // Drag handlers
  const handleDragOver = (e, target) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget(target);
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onStatusChange(itemId, targetStatus);
    }
    setDragOverTarget(null);
  };

  return (
    <div className="item-board-area">
      <div className="boards-container">
        {/* Waiting Board */}
        <div className="board board--waiting">
          <div className="board__header">
            <span className="board__title">Waiting</span>
            <span className="board__count">{waitingItems.length}</span>
          </div>
          <div 
            className={`board__items ${dragOverTarget === 'waiting' ? 'board__items--drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'waiting')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, STATUSES.WAITING)}
          >
            {waitingItems.map(item => (
              <ItemCard
                key={item.id}
                item={enrichWithZone(item)}
                isSelected={item.id === selectedItemId}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>

        {/* In Progress Board */}
        <div className="board board--in-progress">
          <div className="board__header">
            <span className="board__title">In Progress</span>
            <span className="board__count">{inProgressItems.length + (currentItem ? 1 : 0)}</span>
          </div>

          {/* Current Box */}
          <div 
            className={`current-box ${dragOverTarget === 'current' ? 'current-box--drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'current')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, STATUSES.CURRENT)}
          >
            <div className="current-box__label">Current</div>
            {currentItem ? (
              <ItemCard
                item={enrichWithZone(currentItem)}
                isSelected={currentItem.id === selectedItemId}
                isCurrent
                onClick={onItemClick}
              />
            ) : (
              <div className="current-box__empty">
                Drag an item here to set as current focus
              </div>
            )}
          </div>

          {/* In Progress Items */}
          <div 
            className={`board__items ${dragOverTarget === 'in_progress' ? 'board__items--drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'in_progress')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, STATUSES.IN_PROGRESS)}
          >
            {inProgressItems.map(item => (
              <ItemCard
                key={item.id}
                item={enrichWithZone(item)}
                isSelected={item.id === selectedItemId}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
