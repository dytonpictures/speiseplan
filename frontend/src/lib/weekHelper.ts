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
  
  tempDate.setDate(tempDate.getDate() - dayNum + 3);
  const firstThursday = tempDate.valueOf();
  tempDate.setMonth(0, 1);
  
  if (tempDate.getDay() !== 4) {
    tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
  }
  
  const week = 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000); // 7 * 24 * 3600 * 1000
  
  return {
    year: tempDate.getFullYear(),
    week: week
  };
}

/**
 * Berechnet das erste Datum einer Kalenderwoche
 */
export function getDateFromWeek(year: number, week: number): Date {
  const date = new Date(year, 0, 1);
  const dayOfWeek = date.getDay();
  const daysToMonday = dayOfWeek <= 4 ? dayOfWeek - 1 : dayOfWeek - 8;
  
  date.setDate(date.getDate() - daysToMonday);
  date.setDate(date.getDate() + (week - 1) * 7);
  
  return date;
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
  const dec31 = new Date(year, 11, 31);
  const week = getWeekFromDate(dec31);
  return week.year === year ? week.week : week.week - 1;
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