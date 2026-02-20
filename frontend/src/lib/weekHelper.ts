/**
 * Utility-Funktionen für Kalenderwochen-Berechnungen
 * Deutsche Kalenderwoche-Standards (ISO 8601)
 */

/**
 * Berechnet die aktuelle Kalenderwoche
 */
export function getCurrentWeek(): { year: number; week: number } {
  const now = new Date();
  return getWeekFromDate(now);
}

/**
 * Berechnet Kalenderwoche aus einem Datum
 */
export function getWeekFromDate(date: Date): { year: number; week: number } {
  const tempDate = new Date(date.valueOf());
  const dayNum = (tempDate.getDay() + 6) % 7; // Montag = 0
  
  // Zum Donnerstag der gleichen Woche gehen (ISO 8601)
  tempDate.setDate(tempDate.getDate() - dayNum + 3);
  const firstThursday = tempDate.valueOf();
  // Das ISO-Jahr ist das Jahr des Donnerstags
  const isoYear = tempDate.getFullYear();
  
  // Ersten Donnerstag des ISO-Jahres finden
  const jan1 = new Date(isoYear, 0, 1);
  if (jan1.getDay() !== 4) {
    jan1.setMonth(0, 1 + ((4 - jan1.getDay()) + 7) % 7);
  }
  
  const week = 1 + Math.ceil((firstThursday - jan1.valueOf()) / 604800000); // 7 * 24 * 3600 * 1000
  
  return {
    year: isoYear,
    week: week
  };
}

/**
 * Berechnet das erste Datum einer Kalenderwoche
 */
export function getDateFromWeek(year: number, week: number): Date {
  // Find Jan 4 (always in ISO week 1) then find its Monday
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = (jan4.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + (week - 1) * 7);
  
  return monday;
}

/**
 * Berechnet alle Tage einer Kalenderwoche (Mo-Fr)
 */
export function getWeekDays(year: number, week: number): Date[] {
  const monday = getDateFromWeek(year, week);
  const days: Date[] = [];
  
  for (let i = 0; i < 5; i++) { // Nur Mo-Fr
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }
  
  return days;
}

/**
 * Formatiert ein Datum für die Anzeige (DD.MM.)
 */
export function formatDateShort(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.`;
}

/**
 * Navigiert zur nächsten Kalenderwoche
 */
export function getNextWeek(year: number, week: number): { year: number; week: number } {
  const weeksInYear = getWeeksInYear(year);
  
  if (week < weeksInYear) {
    return { year, week: week + 1 };
  } else {
    return { year: year + 1, week: 1 };
  }
}

/**
 * Navigiert zur vorherigen Kalenderwoche
 */
export function getPrevWeek(year: number, week: number): { year: number; week: number } {
  if (week > 1) {
    return { year, week: week - 1 };
  } else {
    const prevYear = year - 1;
    const weeksInPrevYear = getWeeksInYear(prevYear);
    return { year: prevYear, week: weeksInPrevYear };
  }
}

/**
 * Berechnet die Anzahl Kalenderwochen in einem Jahr
 */
export function getWeeksInYear(year: number): number {
  // Dec 28 is always in the last ISO week of its year
  const dec28 = new Date(year, 11, 28);
  const week = getWeekFromDate(dec28);
  return week.week;
}

/**
 * Formatiert Kalenderwoche für Anzeige
 */
export function formatWeek(year: number, week: number): string {
  return `KW ${week} ${year}`;
}

/**
 * Prüft ob eine Kalenderwoche existiert
 */
export function isValidWeek(year: number, week: number): boolean {
  return week >= 1 && week <= getWeeksInYear(year);
}