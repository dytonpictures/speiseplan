import { useState } from 'react';
import { PlanEntry, MealType, WeekDay, GroupLabel, MEAL_NAMES } from '../types';
import { EntryCard, EmptyEntry, GroupLabelSelector } from './EntryCard';
import { ProductSearch } from './ProductSearch';
import { useProducts } from '../hooks/useProducts';

interface MealSlotProps {
  day: WeekDay;
  meal: MealType;
  entries: PlanEntry[];
  onAddEntry: (productId?: number, customText?: string, groupLabel?: GroupLabel) => void;
  onEditEntry?: (entryId: number) => void;
  onRemoveEntry: (entryId: number) => void;
  disabled?: boolean;
  className?: string;
}

export function MealSlot({
  day,
  meal,
  entries,
  onAddEntry,
  onEditEntry,
  onRemoveEntry,
  disabled = false,
  className = ''
}: MealSlotProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroupLabel, setSelectedGroupLabel] = useState<GroupLabel>();
  const { products } = useProducts();

  const mealName = MEAL_NAMES[meal];

  // Handle adding product entry
  const handleAddProduct = (product: any) => {
    onAddEntry(product.id, undefined, selectedGroupLabel);
    setShowAddForm(false);
    setSelectedGroupLabel(undefined);
  };

  // Handle adding custom text entry
  const handleAddCustomText = (text: string) => {
    onAddEntry(undefined, text, selectedGroupLabel);
    setShowAddForm(false);
    setSelectedGroupLabel(undefined);
  };

  // Handle canceling add form
  const handleCancelAdd = () => {
    setShowAddForm(false);
    setSelectedGroupLabel(undefined);
  };

  // Sort entries by slot
  const sortedEntries = [...entries].sort((a, b) => a.slot - b.slot);

  return (
    <div 
      className={`space-y-3 ${className}`}
      role="region"
      aria-label={`${mealName} Einträge`}
    >
      {/* Meal Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 text-sm">
          {mealName}
        </h4>
        
        {!disabled && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-xs text-primary hover:text-blue-700 focus:outline-none focus:underline"
            aria-label={`${mealName} hinzufügen`}
          >
            + Hinzufügen
          </button>
        )}
      </div>

      {/* Entries */}
      {sortedEntries.length > 0 ? (
        <div className="space-y-2">
          {sortedEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={onEditEntry ? () => onEditEntry(entry.id) : undefined}
              onRemove={() => onRemoveEntry(entry.id)}
              compact
              className={disabled ? 'opacity-50' : ''}
            />
          ))}
        </div>
      ) : (
        !showAddForm && (
          <EmptyEntry
            onAdd={disabled ? undefined : () => setShowAddForm(true)}
            mealName={mealName}
            className={disabled ? 'opacity-50' : ''}
          />
        )
      )}

      {/* Add Entry Form */}
      {showAddForm && !disabled && (
        <AddEntryForm
          onAddProduct={handleAddProduct}
          onAddCustomText={handleAddCustomText}
          onCancel={handleCancelAdd}
          selectedGroupLabel={selectedGroupLabel}
          onGroupLabelChange={setSelectedGroupLabel}
          products={products}
          mealName={mealName}
        />
      )}
    </div>
  );
}

// Add Entry Form Component
interface AddEntryFormProps {
  onAddProduct: (product: any) => void;
  onAddCustomText: (text: string) => void;
  onCancel: () => void;
  selectedGroupLabel?: GroupLabel;
  onGroupLabelChange: (label?: GroupLabel) => void;
  products: any[];
  mealName: string;
}

function AddEntryForm({
  onAddProduct,
  onAddCustomText,
  onCancel,
  selectedGroupLabel,
  onGroupLabelChange,
  products,
  mealName
}: AddEntryFormProps) {
  const [customText, setCustomText] = useState('');
  const [mode, setMode] = useState<'search' | 'custom'>('search');

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      onAddCustomText(customText.trim());
    }
  };

  return (
    <div className="border border-primary rounded-md p-4 bg-blue-50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-gray-900">
            {mealName} hinzufügen
          </h5>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Hinzufügen abbrechen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex space-x-1 bg-white rounded-md p-1 border">
          <button
            type="button"
            onClick={() => setMode('search')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded transition-colors ${
              mode === 'search'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            aria-pressed={mode === 'search'}
          >
            Produkt suchen
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded transition-colors ${
              mode === 'custom'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            aria-pressed={mode === 'custom'}
          >
            Freitext eingeben
          </button>
        </div>

        {/* Product Search Mode */}
        {mode === 'search' && (
          <ProductSearch
            products={products}
            onSelect={onAddProduct}
            onCustomText={onAddCustomText}
            placeholder="Produkt suchen..."
            allowCustom
          />
        )}

        {/* Custom Text Mode */}
        {mode === 'custom' && (
          <form onSubmit={handleSubmitCustom} className="space-y-3">
            <div>
              <label htmlFor="custom-text" className="sr-only">
                Freitext für {mealName}
              </label>
              <textarea
                id="custom-text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={`z.B. "Müsli mit Früchten" oder "Butterbrot"`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary min-h-[44px] resize-none"
                rows={2}
                maxLength={200}
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                {customText.length}/200 Zeichen
              </p>
            </div>
            
            <button
              type="submit"
              disabled={!customText.trim()}
              className="btn-primary btn-sm"
            >
              Freitext hinzufügen
            </button>
          </form>
        )}

        {/* Group Label Selector */}
        <GroupLabelSelector
          selectedLabel={selectedGroupLabel}
          onChange={onGroupLabelChange}
        />

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Tipp: Verwenden Sie Tab zum Navigieren
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper styles
const styles = `
  .btn-sm {
    @apply px-3 py-1 text-sm min-h-[36px];
  }
`;