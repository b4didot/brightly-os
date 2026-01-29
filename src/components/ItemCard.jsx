/**
 * ItemCard Component
 * 
 * Simple rectangle displaying item info.
 * No buttons - just title, context, and zone.
 * Supports drag and selection.
 */

export function ItemCard({ 
  item, 
  isSelected, 
  isCurrent,
  onClick,
  onDragStart,
  onDragEnd,
}) {
  const classNames = [
    'item-card',
    isSelected && 'item-card--selected',
    isCurrent && 'item-card--current',
  ].filter(Boolean).join(' ');

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(item);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <div 
      className={classNames}
      onClick={() => onClick?.(item)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="item-card__title">
        {item.title}
      </div>
      <div className="item-card__meta">
        <span className="item-card__context">
          {item.context}
        </span>
        {item.zone_name && (
          <span className="item-card__zone">
            {item.zone_name}
          </span>
        )}
      </div>
    </div>
  );
}
