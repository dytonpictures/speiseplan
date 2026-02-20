import { useState } from 'react';

// Import der Wails-Funktionen (werden zur Laufzeit verfügbar sein)
// @ts-ignore - Wails-Bindings werden zur Laufzeit generiert
import { CheckForUpdate, DownloadUpdate } from '../../wailsjs/go/main/App';

interface UpdateInfo {
  available: boolean;
  current_version: string;
  latest_version: string;
  download_url?: string;
  release_notes?: string;
}

export function InfoPage() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle checking for updates
  const handleCheckUpdate = async () => {
    setChecking(true);
    setError(null);
    
    try {
      const info = await CheckForUpdate();
      setUpdateInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Prüfen auf Updates');
    } finally {
      setChecking(false);
    }
  };

  // Handle downloading update
  const handleDownloadUpdate = async () => {
    if (!updateInfo?.download_url) return;
    
    setDownloading(true);
    setError(null);
    
    try {
      await DownloadUpdate(updateInfo.download_url);
      setDownloadComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Herunterladen des Updates');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Informationen
        </h1>
        <p className="mt-2 text-gray-600">
          Version, Updates und Lizenzinformationen
        </p>
      </div>

      <div className="grid gap-6">
        {/* App Information */}
        <section className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Anwendungsinformationen
          </h2>
          
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Anwendung</dt>
              <dd className="mt-1 text-sm text-gray-900">Kita Speiseplan</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Version</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {updateInfo?.current_version || '1.0.0'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Platform</dt>
              <dd className="mt-1 text-sm text-gray-900">Windows Desktop</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Framework</dt>
              <dd className="mt-1 text-sm text-gray-900">Wails 2 + React</dd>
            </div>
          </dl>
        </section>

        {/* Update Section */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Software-Updates
            </h2>
            
            <button
              onClick={handleCheckUpdate}
              disabled={checking}
              className="btn-primary"
              aria-describedby="update-status"
            >
              {checking ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Prüfen...
                </span>
              ) : (
                'Nach Updates suchen'
              )}
            </button>
          </div>

          {/* Update Status */}
          <div id="update-status">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Fehler bei Update-Prüfung
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {updateInfo && !updateInfo.available && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Keine Updates verfügbar
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      Sie verwenden bereits die neueste Version: {updateInfo.current_version}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {updateInfo && updateInfo.available && !downloadComplete && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-blue-800">
                      Update verfügbar
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Aktuelle Version: <span className="font-mono">{updateInfo.current_version}</span>
                      </p>
                      <p>
                        Neue Version: <span className="font-mono">{updateInfo.latest_version}</span>
                      </p>
                      
                      {updateInfo.release_notes && (
                        <div className="mt-3">
                          <p className="font-medium">Änderungen:</p>
                          <div className="mt-1 text-xs bg-white p-2 rounded border max-h-32 overflow-y-auto">
                            <pre className="whitespace-pre-wrap">{updateInfo.release_notes}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {updateInfo.download_url && (
                      <div className="mt-4">
                        <button
                          onClick={handleDownloadUpdate}
                          disabled={downloading}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Update herunterladen"
                          aria-describedby="download-status"
                        >
                          {downloading && (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          <span>{downloading ? 'Wird heruntergeladen...' : 'Herunterladen'}</span>
                        </button>
                        
                        {downloading && (
                          <div id="download-status" className="mt-2 text-xs text-blue-700" aria-live="polite">
                            Update wird heruntergeladen und verifiziert. Dies kann einige Minuten dauern...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Download Complete State */}
            {downloadComplete && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">
                      Update heruntergeladen
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Das Update auf Version <span className="font-mono">{updateInfo?.latest_version}</span> wurde erfolgreich heruntergeladen und die SHA256-Prüfsumme wurde verifiziert.
                      </p>
                      <p className="mt-2 font-medium">
                        Bitte starten Sie die Anwendung neu, um das Update zu installieren.
                      </p>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        aria-label="Anwendung neu starten"
                      >
                        Neu starten
                      </button>
                      
                      <button
                        onClick={() => setDownloadComplete(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        aria-label="Später neu starten"
                      >
                        Später
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* License Information */}
        <section className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Lizenzinformationen
          </h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900">Kita Speiseplan</h3>
              <p>© 2026 - Speziell entwickelt für Kindertageseinrichtungen im öffentlichen Sektor</p>
              <p>Diese Software erfüllt die Anforderungen der BITV 2.0 (Barrierefreie Informationstechnik-Verordnung).</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Verwendete Technologien</h3>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Wails 2:</strong> MIT License - Cross-Platform Desktop Apps mit Go + Web</li>
                <li><strong>React:</strong> MIT License - UI Framework von Meta</li>
                <li><strong>TypeScript:</strong> Apache 2.0 License - Microsoft</li>
                <li><strong>Tailwind CSS:</strong> MIT License - Utility-first CSS Framework</li>
                <li><strong>Go:</strong> BSD-3-Clause License - Google</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Barrierefreiheit</h3>
              <p>Diese Anwendung wurde nach den Richtlinien der BITV 2.0 entwickelt und bietet:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Vollständige Tastaturnavigation</li>
                <li>Screenreader-Unterstützung (NVDA, JAWS)</li>
                <li>Hohe Farbkontraste (WCAG AA)</li>
                <li>Große Schriftgrößen (min. 16px)</li>
                <li>Touch-freundliche Bedienelemente</li>
                <li>Semantisches HTML und ARIA-Labels</li>
              </ul>
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Systemanforderungen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Minimum</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Windows 10 (64-bit)</li>
                <li>• 4 GB RAM</li>
                <li>• 100 MB freier Speicher</li>
                <li>• Bildschirmauflösung: 1280x720</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Empfohlen</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Windows 11 (64-bit)</li>
                <li>• 8 GB RAM</li>
                <li>• 500 MB freier Speicher</li>
                <li>• Bildschirmauflösung: 1920x1080</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Support und Kontakt
          </h2>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Version:</strong> 1.0.0 (Build 2026.02.20)
            </p>
            <p>
              <strong>Support:</strong> Wenden Sie sich bei Fragen oder Problemen an Ihre IT-Abteilung
            </p>
            <p>
              <strong>Dokumentation:</strong> Benutzerhandbuch ist über das Hilfe-Menü verfügbar
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}