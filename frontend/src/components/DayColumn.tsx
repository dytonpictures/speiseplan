import { WeekDay, PlanEntry, SpecialDay, DAY_NAMES, GroupLabel } from '../types';
import { MealSlot } from './MealSlot';
import { SpecialDayDisplay } from './SpecialDayDialog';

interface DayColumnProps {
  day: WeekDay;
  date: Date;
  entries: PlanEntry[];
  specialDay?: SpecialDay;
  onAddEntry: (day: WeekDay, meal: 'fruehstueck' | 'vesper', productId?: number, customText?: string, groupLabel?: GroupLabel) => void;
  onEditEntry?: (entryId: number) => void;
  onRemoveEntry: (entryId: number) => void;
  onSetSpecialDay?: (day: WeekDay) => void;
  className?: string;
}

export function DayColumn({
  day,
  date,
  entries,
  specialDay,
  onAddEntry,
  onEditEntry,
  onRemoveEntry,
  onSetSpecialDay,
  className = ''
}: DayColumnProps) {
  const dayName = DAY_NAMES[day];
  const isSpecialDay = !!specialDay;

  // Filter entries by meal
  const breakfastEntries = entries.filter(e => e.meal === 'fruehstueck');
  const vesperEntries = entries.filter(e => e.meal === 'vesper');

  // Format date for display
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}.`;
  };

  const handleAddEntry = (meal: 'fruehstueck' | 'vesper', productId?: number, customText?: string, groupLabel?: GroupLabel) => {
    onAddEntry(day, meal, productId, customText, groupLabel);
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}
      role="region"
      aria-label={`${dayName} - ${formatDate(date)}`}
    >
      {/* Day Header */}
      <div 
        className={`p-4 border-b border-gray-200 ${
          isSpecialDay 
            ? specialDay!.type === 'feiertag'
              ? 'bg-yellow-50'
              : 'bg-red-50'
            : 'bg-gray-50'
        }`}
      >
        <div className="text-center">
          <h3 className="font-semibold text-gray-900">
            {dayName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(date)}
          </p>
        </div>

        {/* Special Day Indicator */}
        {!isSpecialDay && onSetSpecialDay && (
          <button
            onClick={() => onSetSpecialDay(day)}
            className="w-full mt-2 text-xs text-gray-500 hover:text-primary focus:outline-none focus:text-primary"
            aria-label={`Sondertag für ${dayName} setzen`}
          >
            + Sondertag
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {isSpecialDay ? (
          /* Special Day Display */
          <SpecialDayDisplay
            specialDay={specialDay!}
            day={day}
            onClick={() => onSetSpecialDay?.(day)}
          />
        ) : (
          /* Regular Day Content */
          <div className="space-y-6">
            {/* Breakfast */}
            <MealSlot
              day={day}
              meal="fruehstueck"
              entries={breakfastEntries}
              onAddEntry={(productId, customText, groupLabel) => 
                handleAddEntry('fruehstueck', productId, customText, groupLabel)
              }
              onEditEntry={onEditEntry}
              onRemoveEntry={onRemoveEntry}
            />

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Vesper */}
            <MealSlot
              day={day}
              meal="vesper"
              entries={vesperEntries}
              onAddEntry={(productId, customText, groupLabel) => 
                handleAddEntry('vesper', productId, customText, groupLabel)
              }
              onEditEntry={onEditEntry}
              onRemoveEntry={onRemoveEntry}
            />
          </div>
        )}
      </div>

      {/* Footer with stats */}
      {!isSpecialDay && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}
            </span>
            
            {/* Allergen Warning */}
            {entries.some(e => e.product?.allergens?.length) && (
              <span className="flex items-center text-orange-600">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Allergene
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Week Day Header (for responsive mobile view if needed)
export function DayHeader({ 
  day, 
  date, 
  specialDay,
  className = '' 
}: {
  day: WeekDay;
  date: Date;
  specialDay?: SpecialDay;
  className?: string;
}) {
  const dayName = DAY_NAMES[day];
  const isSpecialDay = !!specialDay;

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}.`;
  };

  return (
    <div 
      className={`text-center py-2 px-4 ${
        isSpecialDay 
          ? specialDay!.type === 'feiertag'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800'
      } ${className}`}
    >
      <div className="font-semibold text-sm">
        {dayName}
      </div>
      <div className="text-xs opacity-75">
        {formatDate(date)}
      </div>
      {isSpecialDay && (
        <div className="text-xs mt-1 font-medium">
          {specialDay!.type === 'feiertag' ? 'Feiertag' : 'Schließtag'}
        </div>
      )}
    </div>
  );
}