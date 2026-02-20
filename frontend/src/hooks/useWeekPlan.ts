import { useState, useEffect, useCallback } from 'react';
import { WeekPlan, PlanEntry, SpecialDay, MealType, WeekDay, GroupLabel } from '../types';

// Import der Wails-Funktionen (werden zur Laufzeit verfügbar sein)
// @ts-ignore - Wails-Bindings werden zur Laufzeit generiert
import { GetWeekPlan, CreateWeekPlan, CopyWeekPlan, AddPlanEntry, RemovePlanEntry, UpdatePlanEntry, SetSpecialDay, RemoveSpecialDay } from '../../wailsjs/go/main/App';

export function useWeekPlan(year: number, week: number) {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wochenplan laden
  const loadWeekPlan = useCallback(async () => {
    if (!year || !week) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const plan = await GetWeekPlan(year, week);
      setWeekPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Wochenplans');
      setWeekPlan(null);
    } finally {
      setLoading(false);
    }
  }, [year, week]);

  // Neuen Wochenplan erstellen
  const createWeekPlan = async (): Promise<WeekPlan | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newPlan = await CreateWeekPlan(year, week);
      setWeekPlan(newPlan);
      return newPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Wochenplans');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Wochenplan kopieren
  const copyWeekPlan = async (srcYear: number, srcWeek: number): Promise<WeekPlan | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const copiedPlan = await CopyWeekPlan(srcYear, srcWeek, year, week);
      setWeekPlan(copiedPlan);
      return copiedPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Kopieren des Wochenplans');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eintrag hinzufügen
  const addEntry = async (
    day: WeekDay, 
    meal: MealType, 
    productId?: number, 
    customText?: string, 
    groupLabel?: GroupLabel
  ): Promise<PlanEntry | null> => {
    if (!weekPlan) return null;
    
    try {
      const newEntry = await AddPlanEntry(weekPlan.id, day, meal, productId, customText, groupLabel);
      
      // State aktualisieren
      setWeekPlan(prev => prev ? {
        ...prev,
        entries: [...prev.entries, newEntry]
      } : null);
      
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Eintrags');
      return null;
    }
  };

  // Eintrag entfernen
  const removeEntry = async (entryId: number): Promise<boolean> => {
    try {
      await RemovePlanEntry(entryId);
      
      // State aktualisieren
      setWeekPlan(prev => prev ? {
        ...prev,
        entries: prev.entries.filter(e => e.id !== entryId)
      } : null);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Entfernen des Eintrags');
      return false;
    }
  };

  // Eintrag bearbeiten
  const updateEntry = async (
    entryId: number,
    productId?: number,
    customText?: string,
    groupLabel?: GroupLabel
  ): Promise<PlanEntry | null> => {
    try {
      const updatedEntry = await UpdatePlanEntry(entryId, productId, customText, groupLabel);
      
      // State aktualisieren
      setWeekPlan(prev => prev ? {
        ...prev,
        entries: prev.entries.map(e => e.id === entryId ? updatedEntry : e)
      } : null);
      
      return updatedEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Bearbeiten des Eintrags');
      return null;
    }
  };

  // Sondertag setzen
  const setSpecialDay = async (day: WeekDay, type: string, label?: string): Promise<boolean> => {
    if (!weekPlan) return false;
    
    try {
      await SetSpecialDay(weekPlan.id, day, type, label);
      
      // State aktualisieren
      const newSpecialDay: SpecialDay = {
        id: Date.now(), // Temporäre ID - wird vom Backend überschrieben
        week_plan_id: weekPlan.id,
        day,
        type,
        label
      };
      
      setWeekPlan(prev => prev ? {
        ...prev,
        special_days: [...prev.special_days.filter(s => s.day !== day), newSpecialDay]
      } : null);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Setzen des Sondertags');
      return false;
    }
  };

  // Sondertag entfernen
  const removeSpecialDay = async (day: WeekDay): Promise<boolean> => {
    if (!weekPlan) return false;
    
    try {
      await RemoveSpecialDay(weekPlan.id, day);
      
      // State aktualisieren
      setWeekPlan(prev => prev ? {
        ...prev,
        special_days: prev.special_days.filter(s => s.day !== day)
      } : null);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Entfernen des Sondertags');
      return false;
    }
  };

  // Helper-Funktionen für UI
  const getEntriesForDay = (day: WeekDay, meal: MealType): PlanEntry[] => {
    if (!weekPlan) return [];
    return weekPlan.entries
      .filter(e => e.day === day && e.meal === meal)
      .sort((a, b) => a.slot - b.slot);
  };

  const getSpecialDay = (day: WeekDay): SpecialDay | undefined => {
    if (!weekPlan) return undefined;
    return weekPlan.special_days.find(s => s.day === day);
  };

  const isDaySpecial = (day: WeekDay): boolean => {
    return !!getSpecialDay(day);
  };

  // Initial laden
  useEffect(() => {
    loadWeekPlan();
  }, [loadWeekPlan]);

  return {
    weekPlan,
    loading,
    error,
    loadWeekPlan,
    createWeekPlan,
    copyWeekPlan,
    addEntry,
    removeEntry,
    updateEntry,
    setSpecialDay,
    removeSpecialDay,
    // Helper
    getEntriesForDay,
    getSpecialDay,
    isDaySpecial,
    // Clear error
    clearError: () => setError(null)
  };
}