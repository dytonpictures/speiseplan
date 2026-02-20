import { useState } from 'react';
import { WeekPlan, WeekDay, GroupLabel, SpecialDayType } from '../types';
import { DayColumn } from './DayColumn';
import { SpecialDayDialog } from './SpecialDayDialog';
import { getWeekDays } from '../lib/weekHelper';
import { useWeekPlan } from '../hooks/useWeekPlan';

interface WeekPlannerProps {
  year: number;
  week: number;
  className?: string;
}

export function WeekPlanner({ year, week, className = '' }: WeekPlannerProps) {
  const [specialDayDialog, setSpecialDayDialog] = useState<{ day: WeekDay } | null>(null);
  
  const {
    weekPlan,
    loading,
    error,
    createWeekPlan,
    addEntry,
    removeEntry,
    setSpecialDay,
    removeSpecialDay,
    getEntriesForDay,
    getSpecialDay,
    clearError
  } = useWeekPlan(year, week);

  // Get week days
  const weekDays = getWeekDays(year, week);

  // Handle adding entry
  const handleAddEntry = async (
    day: WeekDay, 
    meal: 'fruehstueck' | 'vesper', 
    productId?: number, 
    customText?: string, 
    groupLabel?: GroupLabel
  ) => {
    await addEntry(day, meal, productId, customText, groupLabel);
  };

  // Handle removing entry
  const handleRemoveEntry = async (entryId: number) => {
    await removeEntry(entryId);
  };

  // Handle setting special day
  const handleSetSpecialDay = (day: WeekDay) => {
    setSpecialDayDialog({ day });
  };

  // Handle saving special day
  const handleSaveSpecialDay = async (day: WeekDay, type: SpecialDayType, label?: string) => {
    await setSpecialDay(day, type, label);
    setSpecialDayDialog(null);
  };

  // Handle removing special day
  const handleRemoveSpecialDay = async (day: WeekDay) => {
    await removeSpecialDay(day);
    setSpecialDayDialog(null);
  };

  // Handle creating new week plan
  const handleCreateWeekPlan = async () => {
    await createWeekPlan();
  };

  // Loading state
  if (loading && !weekPlan) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Wochenplan wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !weekPlan) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Fehler beim Laden</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => {
                clearError();
                window.location.reload();
              }}
              className="btn-primary"
            >
              Neu laden
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No week plan exists
  if (!weekPlan) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Kein Wochenplan vorhanden
          </h3>
          <p className="mt-2 text-gray-600">
            Für KW {week} {year} ist noch kein Wochenplan erstellt.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateWeekPlan}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Wird erstellt...' : 'Wochenplan erstellen'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} aria-live="polite">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Fehler
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-3">
                <button
                  onClick={clearError}
                  className="text-sm text-red-800 hover:text-red-600 focus:outline-none focus:underline"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Week Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Wochenplan KW {week} {year}
          </h1>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Erstellt: {new Date(weekPlan.created_at).toLocaleDateString('de-DE')}</span>
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {weekDays.map((date, index) => {
          const dayNumber = (index + 1) as WeekDay;
          const dayEntries = getEntriesForDay(dayNumber, 'fruehstueck').concat(
            getEntriesForDay(dayNumber, 'vesper')
          );
          const daySpecialDay = getSpecialDay(dayNumber);

          return (
            <DayColumn
              key={dayNumber}
              day={dayNumber}
              date={date}
              entries={dayEntries}
              specialDay={daySpecialDay}
              onAddEntry={handleAddEntry}
              onRemoveEntry={handleRemoveEntry}
              onSetSpecialDay={handleSetSpecialDay}
              className="h-fit"
            />
          );
        })}
      </div>

      {/* Week Statistics */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">
            {weekPlan.entries?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Einträge gesamt</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {weekPlan.entries?.filter(e => e.meal === 'fruehstueck').length || 0}
          </div>
          <div className="text-sm text-gray-600">Frühstück</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {weekPlan.entries?.filter(e => e.meal === 'vesper').length || 0}
          </div>
          <div className="text-sm text-gray-600">Vesper</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-yellow-600">
            {weekPlan.special_days?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Sondertage</div>
        </div>
      </div>

      {/* Special Day Dialog */}
      {specialDayDialog && (
        <SpecialDayDialog
          day={specialDayDialog.day}
          existingSpecialDay={getSpecialDay(specialDayDialog.day)}
          onSave={handleSaveSpecialDay}
          onRemove={handleRemoveSpecialDay}
          onCancel={() => setSpecialDayDialog(null)}
        />
      )}
    </div>
  );
}