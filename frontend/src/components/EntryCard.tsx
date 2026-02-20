import { PlanEntry, GroupLabel, GROUP_LABELS } from '../types';
import { AllergenList } from './AllergenBadge';

interface EntryCardProps {
  entry: PlanEntry;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
  compact?: boolean;
}

export function EntryCard({ 
  entry, 
  onEdit, 
  onRemove, 
  className = '',
  compact = false 
}: EntryCardProps) {
  const hasProduct = entry.product_id && entry.product;
  const isCustomText = !hasProduct && entry.custom_text;
  
  return (
    <div 
      className={`bg-white border border-gray-200 rounded-md p-3 shadow-sm hover:shadow-md transition-shadow ${className}`}
      role="article"
      aria-label={
        hasProduct 
          ? `Produkt: ${entry.product?.name}`
          : `Freitext: ${entry.custom_text}`
      }
    >
      {/* Content */}
      <div className="space-y-2">
        {/* Product or Custom Text */}
        {hasProduct ? (
          <div>
            <div className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {entry.product!.name}
            </div>
            
            {/* Allergens and Additives */}
            {!compact && (entry.product!.allergens?.length || entry.product!.additives?.length) && (
              <div className="flex items-center gap-3 mt-2">
                {entry.product!.allergens?.length > 0 && (
                  <AllergenList 
                    allergens={entry.product!.allergens} 
                    size="sm"
                    maxVisible={compact ? 3 : 6}
                  />
                )}
                
                {entry.product!.additives?.length > 0 && (
                  <span className="text-xs text-gray-500 font-mono">
                    {entry.product!.additives.map(a => a.id).sort().join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : isCustomText ? (
          <div 
            className={`text-gray-900 ${compact ? 'text-sm' : 'text-base'} ${entry.custom_text!.length > 50 ? 'text-sm' : ''}`}
          >
            {entry.custom_text}
          </div>
        ) : (
          <div className="text-gray-400 italic text-sm">
            Leerer Eintrag
          </div>
        )}

        {/* Group Label */}
        {entry.group_label && (
          <div className="flex items-center justify-between">
            <GroupLabelBadge 
              label={entry.group_label as GroupLabel} 
              size={compact ? 'sm' : 'md'} 
            />
          </div>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onRemove) && (
        <div className="flex items-center justify-end space-x-2 mt-3 pt-2 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs text-primary hover:text-blue-700 focus:outline-none focus:underline"
              aria-label={`Eintrag bearbeiten`}
            >
              Bearbeiten
            </button>
          )}
          
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-xs text-gray-500 hover:text-red-600 focus:outline-none focus:underline"
              aria-label={`Eintrag entfernen`}
            >
              Entfernen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Group Label Badge Component
interface GroupLabelBadgeProps {
  label: GroupLabel;
  size?: 'sm' | 'md';
  className?: string;
}

export function GroupLabelBadge({ label, size = 'md', className = '' }: GroupLabelBadgeProps) {
  const colors: Record<GroupLabel, string> = {
    'Krippe': 'bg-pink-100 text-pink-800 border-pink-200',
    'Kita': 'bg-blue-100 text-blue-800 border-blue-200',
    'Hort': 'bg-green-100 text-green-800 border-green-200'
  };

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : 'text-sm px-2 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${colors[label]} ${sizeClasses} ${className}`}
      title={`Gruppe: ${label}`}
      aria-label={`Gruppe: ${label}`}
    >
      {label}
    </span>
  );
}

// Group Label Selector Component
interface GroupLabelSelectorProps {
  selectedLabel?: GroupLabel;
  onChange: (label?: GroupLabel) => void;
  className?: string;
}

export function GroupLabelSelector({ 
  selectedLabel, 
  onChange, 
  className = '' 
}: GroupLabelSelectorProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Zielgruppe (optional)
      </label>
      
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`px-3 py-1 text-sm rounded-md border transition-colors min-h-[44px] ${
            !selectedLabel
              ? 'bg-gray-200 text-gray-800 border-gray-300'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
          aria-pressed={!selectedLabel}
        >
          Alle
        </button>
        
        {GROUP_LABELS.map(label => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(label)}
            className={`px-3 py-1 text-sm rounded-md border transition-colors min-h-[44px] ${
              selectedLabel === label
                ? (() => {
                    switch(label) {
                      case 'Krippe': return 'bg-pink-100 text-pink-800 border-pink-300';
                      case 'Kita': return 'bg-blue-100 text-blue-800 border-blue-300';
                      case 'Hort': return 'bg-green-100 text-green-800 border-green-300';
                    }
                  })()
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
            aria-pressed={selectedLabel === label}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Empty Entry Placeholder
interface EmptyEntryProps {
  onAdd?: () => void;
  className?: string;
  mealName?: string;
}

export function EmptyEntry({ onAdd, className = '', mealName }: EmptyEntryProps) {
  return (
    <div 
      className={`border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors ${className}`}
    >
      <svg 
        className="mx-auto h-8 w-8 text-gray-400 mb-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      
      <p className="text-sm text-gray-500 mb-2">
        {mealName ? `${mealName} hinzufügen` : 'Eintrag hinzufügen'}
      </p>
      
      {onAdd && (
        <button
          onClick={onAdd}
          className="text-sm text-primary hover:text-blue-700 focus:outline-none focus:underline"
          aria-label={`${mealName || 'Eintrag'} hinzufügen`}
        >
          Hinzufügen
        </button>
      )}
    </div>
  );
}