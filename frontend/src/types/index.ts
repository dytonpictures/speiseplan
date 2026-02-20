// TypeScript-Interfaces basierend auf Go-Models

export interface Allergen {
  id: string;
  name: string;
  category: string;
}

export interface Additive {
  id: string;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  multiline: boolean;
  allergens: Allergen[];
  additives: Additive[];
}

export interface WeekPlan {
  id: number;
  year: number;
  week: number;
  created_at: string;
  entries: PlanEntry[];
  special_days: SpecialDay[];
}

export interface PlanEntry {
  id: number;
  week_plan_id: number;
  day: number; // 1=Montag, 2=Dienstag, ..., 5=Freitag
  meal: string; // 'fruehstueck' | 'vesper'
  slot: number;
  product_id?: number;
  product?: Product;
  custom_text?: string;
  group_label?: string; // 'Krippe' | 'Kita' | 'Hort'
}

export interface SpecialDay {
  id: number;
  week_plan_id: number;
  day: number; // 1-5 (Mo-Fr)
  type: string; // 'feiertag' | 'schliesstag'
  label?: string;
}

export interface UpdateInfo {
  available: boolean;
  current_version: string;
  latest_version: string;
  download_url?: string;
  release_notes?: string;
}

// UI-spezifische Types
export type MealType = 'fruehstueck' | 'vesper';
export type GroupLabel = 'Krippe' | 'Kita' | 'Hort';
export type SpecialDayType = 'feiertag' | 'schliesstag';
export type WeekDay = 1 | 2 | 3 | 4 | 5; // Mo-Fr

// Navigation
export type NavRoute = 'wochenplan' | 'produkte' | 'info';

// Form States
export interface ProductFormData {
  name: string;
  multiline: boolean;
  allergenIds: string[];
  additiveIds: string[];
}

export interface AddEntryFormData {
  meal: MealType;
  productId?: number;
  customText?: string;
  groupLabel?: GroupLabel;
}

// Konstanten für Deutsche Texte
export const DAY_NAMES: Record<WeekDay, string> = {
  1: 'Montag',
  2: 'Dienstag', 
  3: 'Mittwoch',
  4: 'Donnerstag',
  5: 'Freitag'
};

export const MEAL_NAMES: Record<MealType, string> = {
  fruehstueck: 'Frühstück',
  vesper: 'Vesper'
};

export const GROUP_LABELS: GroupLabel[] = ['Krippe', 'Kita', 'Hort'];

export const SPECIAL_DAY_NAMES: Record<SpecialDayType, string> = {
  feiertag: 'Feiertag',
  schliesstag: 'Schließtag'
};