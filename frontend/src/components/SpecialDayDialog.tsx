import { useState } from 'react';
import { SpecialDay, SpecialDayType, WeekDay, DAY_NAMES, SPECIAL_DAY_NAMES } from '../types';

interface SpecialDayDialogProps {
  day: WeekDay;
  existingSpecialDay?: SpecialDay;
  onSave: (day: WeekDay, type: SpecialDayType, label?: string) => void;
  onRemove?: (day: WeekDay) => void;
  onCancel: () => void;
}

export function SpecialDayDialog({
  day,
  existingSpecialDay,
  onSave,
  onRemove,
  onCancel
}: SpecialDayDialogProps) {
  const [type, setType] = useState<SpecialDayType>(
    (existingSpecialDay?.type as SpecialDayType) || 'feiertag'
  );
  const [label, setLabel] = useState(existingSpecialDay?.label || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(day, type, label.trim() || undefined);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(day);
    }
  };

  const isEditing = !!existingSpecialDay;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Sondertag für {DAY_NAMES[day]}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dialog schließen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Type Selection */}
            <div>
              <fieldset>
                <legend className="text-sm font-medium text-gray-700 mb-3">
                  Art des Sondertags
                </legend>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
                    <input
                      type="radio"
                      value="feiertag"
                      checked={type === 'feiertag'}
                      onChange={(e) => setType(e.target.value as SpecialDayType)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {SPECIAL_DAY_NAMES.feiertag}
                      </div>
                      <div className="text-sm text-gray-500">
                        Gesetzlicher oder betrieblicher Feiertag
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
                    <input
                      type="radio"
                      value="schliesstag"
                      checked={type === 'schliesstag'}
                      onChange={(e) => setType(e.target.value as SpecialDayType)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {SPECIAL_DAY_NAMES.schliesstag}
                      </div>
                      <div className="text-sm text-gray-500">
                        Kita ist geschlossen (z.B. Betriebsurlaub)
                      </div>
                    </div>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Label Input */}
            <div>
              <label htmlFor="special-day-label" className="block text-sm font-medium text-gray-700 mb-2">
                Bezeichnung (optional)
              </label>
              <input
                id="special-day-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={
                  type === 'feiertag' 
                    ? 'z.B. Tag der Deutschen Einheit'
                    : 'z.B. Betriebsurlaub'
                }
                className="input"
                maxLength={50}
              />
              <p className="mt-1 text-sm text-gray-500">
                Wird zusätzlich zum Sondertagtyp angezeigt
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-3 rounded-md border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vorschau</h4>
              <div 
                className={`p-3 rounded-md text-center ${
                  type === 'feiertag' 
                    ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                    : 'bg-red-100 border border-red-300 text-red-800'
                }`}
              >
                <div className="font-medium">
                  {SPECIAL_DAY_NAMES[type]}
                </div>
                {label && (
                  <div className="text-sm mt-1">
                    {label}
                  </div>
                )}
                <div className="text-xs mt-1 opacity-75">
                  {DAY_NAMES[day]}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div>
              {isEditing && onRemove && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="btn-danger"
                >
                  Sondertag entfernen
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
              >
                Abbrechen
              </button>

              <button
                type="submit"
                className="btn-primary"
              >
                {isEditing ? 'Ändern' : 'Setzen'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Preview component for showing special days in the week planner
interface SpecialDayDisplayProps {
  specialDay: SpecialDay;
  day: WeekDay;
  onClick?: () => void;
  className?: string;
}

export function SpecialDayDisplay({ 
  specialDay, 
  day, 
  onClick, 
  className = '' 
}: SpecialDayDisplayProps) {
  const isHoliday = specialDay.type === 'feiertag';
  
  return (
    <div 
      className={`p-3 rounded-md text-center cursor-pointer transition-colors ${
        isHoliday
          ? 'bg-yellow-100 border border-yellow-300 text-yellow-800 hover:bg-yellow-200'
          : 'bg-red-100 border border-red-300 text-red-800 hover:bg-red-200'
      } ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Sondertag für ${DAY_NAMES[day]}: ${SPECIAL_DAY_NAMES[specialDay.type as SpecialDayType]}${specialDay.label ? ` - ${specialDay.label}` : ''}`}
    >
      <div className="font-medium text-sm">
        {SPECIAL_DAY_NAMES[specialDay.type as SpecialDayType]}
      </div>
      {specialDay.label && (
        <div className="text-xs mt-1">
          {specialDay.label}
        </div>
      )}
      <div className="text-xs mt-1 opacity-75">
        Klicken zum Bearbeiten
      </div>
    </div>
  );
}