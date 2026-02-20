import { useState, createContext, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { getCurrentWeek } from '../lib/weekHelper';
import { useWeekPlan } from '../hooks/useWeekPlan';

// Context für die ausgewählte Woche
interface WeekContextType {
  selectedWeek: { year: number; week: number };
  setSelectedWeek: (week: { year: number; week: number }) => void;
}

const WeekContext = createContext<WeekContextType | null>(null);

export function Layout() {
  const navigate = useNavigate();
  const currentWeek = getCurrentWeek();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  const { createWeekPlan, copyWeekPlan } = useWeekPlan(selectedWeek.year, selectedWeek.week);

  // Handle week change navigation
  const handleWeekChange = (year: number, week: number) => {
    setSelectedWeek({ year, week });
    // Navigate to home if not already there
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  // Handle creating new week plan
  const handleCreateWeek = async (year: number, week: number) => {
    try {
      await createWeekPlan();
      // Success handled by the hook
    } catch (error) {
      console.error('Fehler beim Erstellen des Wochenplans:', error);
    }
  };

  // Handle copying week plan
  const handleCopyWeek = async (srcYear: number, srcWeek: number) => {
    try {
      await copyWeekPlan(srcYear, srcWeek);
      // Success handled by the hook
    } catch (error) {
      console.error('Fehler beim Kopieren des Wochenplans:', error);
    }
  };

  return (
    <WeekContext.Provider value={{ selectedWeek, setSelectedWeek }}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          currentYear={selectedWeek.year}
          currentWeek={selectedWeek.week}
          onWeekChange={handleWeekChange}
          onCreateWeek={handleCreateWeek}
          onCopyWeek={handleCopyWeek}
        />

        {/* Main Content */}
        <main 
          className="flex-1 overflow-auto focus:outline-none"
          id="main-content"
          role="main"
          aria-label="Hauptinhalt"
          tabIndex={-1}
        >
          <div className="p-6 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </WeekContext.Provider>
  );
}

// Hook for accessing the selected week in child components
export function useSelectedWeek() {
  const context = useContext(WeekContext);
  if (!context) {
    return getCurrentWeek();
  }
  return context.selectedWeek;
}