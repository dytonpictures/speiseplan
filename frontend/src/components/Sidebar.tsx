import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getCurrentWeek, getNextWeek, getPrevWeek, formatWeek, isValidWeek } from '../lib/weekHelper';

interface SidebarProps {
  currentYear: number;
  currentWeek: number;
  onWeekChange: (year: number, week: number) => void;
  onCreateWeek?: (year: number, week: number) => void;
  onCopyWeek?: (year: number, week: number) => void;
}

export function Sidebar({ 
  currentYear, 
  currentWeek, 
  onWeekChange, 
  onCreateWeek,
  onCopyWeek 
}: SidebarProps) {
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  // Handle week navigation
  const handlePrevWeek = () => {
    const prev = getPrevWeek(currentYear, currentWeek);
    onWeekChange(prev.year, prev.week);
  };

  const handleNextWeek = () => {
    const next = getNextWeek(currentYear, currentWeek);
    onWeekChange(next.year, next.week);
  };

  const handleCurrentWeek = () => {
    const current = getCurrentWeek();
    onWeekChange(current.year, current.week);
  };

  // Handle keyboard navigation
  const handleWeekNavKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevWeek();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNextWeek();
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleCurrentWeek();
    }
  };

  const navigationItems = [
    {
      name: 'Wochenplan',
      to: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Produkte',
      to: '/produkte',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: 'Info',
      to: '/info',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Skip-to-content Link */}
      <a 
        href="#main-content" 
        className="skip-link"
      >
        Zum Hauptinhalt springen
      </a>

      <aside 
        className="w-64 bg-white border-r border-gray-200 flex flex-col h-full"
        aria-label="Hauptnavigation"
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Speiseplan
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Kita Wochenplanung
          </p>
        </div>

        {/* Week Navigator */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-4">
            {/* Current Week Display */}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {formatWeek(currentYear, currentWeek)}
              </h2>
              <p className="text-sm text-gray-600">
                Aktuelle Auswahl
              </p>
            </div>

            {/* Navigation Controls */}
            <div 
              className="flex items-center justify-between"
              onKeyDown={handleWeekNavKeyDown}
              role="group"
              aria-label="Kalenderwoche navigieren"
              tabIndex={0}
            >
              <button
                onClick={handlePrevWeek}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px]"
                aria-label="Vorherige Kalenderwoche"
                title="Vorherige KW (Pfeil links)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handleCurrentWeek}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                title="Aktuelle KW (Pos1)"
              >
                Heute
              </button>

              <button
                onClick={handleNextWeek}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px]"
                aria-label="Nächste Kalenderwoche"
                title="Nächste KW (Pfeil rechts)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              {onCreateWeek && (
                <button
                  onClick={() => onCreateWeek(currentYear, currentWeek)}
                  className="w-full btn-primary text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Neue KW anlegen
                </button>
              )}

              {onCopyWeek && (
                <button
                  onClick={() => setShowCopyDialog(true)}
                  className="w-full btn-secondary text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  KW kopieren
                </button>
              )}
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">←→</kbd> KW wechseln</p>
              <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Pos1</kbd> Aktuelle KW</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4" role="navigation" aria-label="Hauptmenü">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                  end={item.to === '/'}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          <p>© 2026 Kita Speiseplan</p>
          <p className="mt-1">Barrierefreie Desktop-App</p>
        </div>
      </aside>

      {/* Copy Week Dialog */}
      {showCopyDialog && (
        <CopyWeekDialog
          targetYear={currentYear}
          targetWeek={currentWeek}
          onCopy={(srcYear, srcWeek) => {
            onCopyWeek?.(srcYear, srcWeek);
            setShowCopyDialog(false);
          }}
          onCancel={() => setShowCopyDialog(false)}
        />
      )}
    </>
  );
}

// Copy Week Dialog Component
interface CopyWeekDialogProps {
  targetYear: number;
  targetWeek: number;
  onCopy: (srcYear: number, srcWeek: number) => void;
  onCancel: () => void;
}

function CopyWeekDialog({ targetYear, targetWeek, onCopy, onCancel }: CopyWeekDialogProps) {
  const [srcYear, setSrcYear] = useState(targetYear);
  const [srcWeek, setSrcWeek] = useState(Math.max(1, targetWeek - 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidWeek(srcYear, srcWeek)) {
      onCopy(srcYear, srcWeek);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Kalenderwoche kopieren"
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Kalenderwoche kopieren
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Welche Kalenderwoche soll nach <strong>{formatWeek(targetYear, targetWeek)}</strong> kopiert werden?
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="src-year" className="block text-sm font-medium text-gray-700 mb-1">
                  Jahr
                </label>
                <input
                  id="src-year"
                  type="number"
                  value={srcYear}
                  onChange={(e) => setSrcYear(parseInt(e.target.value) || targetYear)}
                  min="2020"
                  max="2030"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="src-week" className="block text-sm font-medium text-gray-700 mb-1">
                  KW
                </label>
                <input
                  id="src-week"
                  type="number"
                  value={srcWeek}
                  onChange={(e) => setSrcWeek(parseInt(e.target.value) || 1)}
                  min="1"
                  max="53"
                  className="input"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Quelle:</strong> {formatWeek(srcYear, srcWeek)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Ziel:</strong> {formatWeek(targetYear, targetWeek)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
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
              disabled={!isValidWeek(srcYear, srcWeek)}
            >
              Kopieren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}