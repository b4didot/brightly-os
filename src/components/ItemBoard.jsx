/**
 * ItemBoard Component
 * 
 * Left side of the app containing:
 * - Waiting board (left column, full height)
 * - Current board (right column, top)
 * - In Progress board (right column, bottom)
 * 
 * Supports drag-and-drop between boards.
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
  onItemReorder,
}) {
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);

  // Separate items by status and sort by priority_order
  const currentItem = items.find(item => item.status === STATUSES.CURRENT);
  const waitingItems = items
    .filter(item => item.status === STATUSES.WAITING)
    .sort((a, b) => a.priority_order - b.priority_order);
  const inProgressItems = items
    .filter(item => item.status === STATUSES.IN_PROGRESS)
    .sort((a, b) => a.priority_order - b.priority_order);

  // Enrich items with zone names
  const enrichWithZone = (item) => ({
    ...item,
    zone_name: item.zone_id ? zones.find(z => z.id === item.zone_id)?.name : null,
  });

  // Drag handlers for board areas (status change)
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
    if (itemId && draggedItem) {
      // Check if we're dropping in the same board (for reordering)
      if (draggedItem.status === targetStatus && dragOverItemId) {
        // Reordering within the same board
        handleReorder(draggedItem, dragOverItemId, targetStatus);
      } else if (draggedItem.status !== targetStatus) {
        // Moving to a different board (status change)
        onStatusChange(itemId, targetStatus);
      }
    }
    setDragOverTarget(null);
    setDraggedItem(null);
    setDragOverItemId(null);
  };

  // Drag handlers for individual cards (reordering)
  const handleCardDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleCardDragEnd = () => {
    setDraggedItem(null);
    setDragOverItemId(null);
  };

  const handleCardDragOver = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow reordering within the same board
    if (draggedItem && draggedItem.status === item.status && draggedItem.id !== item.id) {
      setDragOverItemId(item.id);
    }
  };

  const handleCardDragLeave = (e, item) => {
    // Only clear if we're actually leaving this card
    if (e.currentTarget === e.target) {
      setDragOverItemId(null);
    }
  };

  const handleCardDrop = (e, targetItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedItem && draggedItem.id !== targetItem.id && draggedItem.status === targetItem.status) {
      handleReorder(draggedItem, targetItem.id, targetItem.status);
    }
    
    setDragOverItemId(null);
    setDraggedItem(null);
  };

  // Reorder items within a board
  const handleReorder = (draggedItem, targetItemId, status) => {
    // Get all items in the same board
    const boardItems = items.filter(item => item.status === status);
    
    // Sort by priority_order
    boardItems.sort((a, b) => a.priority_order - b.priority_order);
    
    // Remove dragged item
    const withoutDragged = boardItems.filter(item => item.id !== draggedItem.id);
    
    // Find target index
    const targetIndex = withoutDragged.findIndex(item => item.id === targetItemId);
    
    // Insert dragged item at target position
    const newOrder = [...withoutDragged];
    newOrder.splice(targetIndex, 0, draggedItem);
    
    // Call reorder with the new order for just these items
    onItemReorder(newOrder);
  };

  return (
    <div className="item-board-area">
      <div className="boards-container">
        {/* Left Column - Waiting Board */}
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
            {waitingItems.map(item => {
              const enrichedItem = enrichWithZone(item);
              return (
                <ItemCard
                  key={item.id}
                  item={enrichedItem}
                  isSelected={item.id === selectedItemId}
                  isDragOver={dragOverItemId === item.id}
                  onClick={onItemClick}
                  onDragStart={handleCardDragStart}
                  onDragEnd={handleCardDragEnd}
                  onDragOver={(e) => handleCardDragOver(e, item)}
                  onDragLeave={(e) => handleCardDragLeave(e, item)}
                  onDrop={(e) => handleCardDrop(e, item)}
                />
              );
            })}
          </div>
        </div>

        {/* Right Column - Current + In Progress */}
        <div className="boards-column">
          {/* Current Board */}
          <div 
            className={`board board--current ${dragOverTarget === 'current' ? 'board--drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'current')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, STATUSES.CURRENT)}
          >
            <div className="board__header">
              <span className="board__title">Current</span>
              <span className="board__count">{currentItem ? 1 : 0}</span>
            </div>
            <div className="board__items board__items--current">
              {currentItem ? (
                <ItemCard
                  item={enrichWithZone(currentItem)}
                  isSelected={currentItem.id === selectedItemId}
                  isCurrent
                  onClick={onItemClick}
                />
              ) : (
                <div className="board__empty">
                  Drag an item here to set as current focus
                </div>
              )}
            </div>
          </div>

          {/* In Progress Board */}
          <div className="board board--in-progress">
            <div className="board__header">
              <span className="board__title">In Progress</span>
              <span className="board__count">{inProgressItems.length}</span>
            </div>
            <div 
              className={`board__items ${dragOverTarget === 'in_progress' ? 'board__items--drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'in_progress')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, STATUSES.IN_PROGRESS)}
            >
              {inProgressItems.map(item => {
                const enrichedItem = enrichWithZone(item);
                return (
                  <ItemCard
                    key={item.id}
                    item={enrichedItem}
                    isSelected={item.id === selectedItemId}
                    isDragOver={dragOverItemId === item.id}
                    onClick={onItemClick}
                    onDragStart={handleCardDragStart}
                    onDragEnd={handleCardDragEnd}
                    onDragOver={(e) => handleCardDragOver(e, item)}
                    onDragLeave={(e) => handleCardDragLeave(e, item)}
                    onDrop={(e) => handleCardDrop(e, item)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
