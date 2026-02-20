package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const (
	// Aktuelle Version der App
	CurrentVersion = "1.0.0"
	// Update-Check URL
	UpdateURL = "https://speiseplan.supertoll.xyz/version.json"
)

// Updater verwaltet App-Updates
type Updater struct {
	CurrentVersion string
	UpdateURL      string
	HTTPClient     *http.Client
}

// NewUpdater erstellt einen neuen Updater
func NewUpdater() *Updater {
	return &Updater{
		CurrentVersion: CurrentVersion,
		UpdateURL:      UpdateURL,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// VersionResponse repräsentiert die Antwort vom Update-Server
type VersionResponse struct {
	Version      string `json:"version"`
	DownloadURL  string `json:"download_url"`
	ReleaseNotes string `json:"release_notes"`
}

// CheckForUpdate prüft ob ein Update verfügbar ist
func (u *Updater) CheckForUpdate() (*UpdateInfo, error) {
	resp, err := u.HTTPClient.Get(u.UpdateURL)
	if err != nil {
		return nil, fmt.Errorf("failed to check for updates: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("update server returned status %d", resp.StatusCode)
	}

	var versionResp VersionResponse
	if err := json.NewDecoder(resp.Body).Decode(&versionResp); err != nil {
		return nil, fmt.Errorf("failed to parse version response: %w", err)
	}

	// Versions-Vergleich (vereinfacht)
	available := compareVersions(u.CurrentVersion, versionResp.Version) < 0

	return &UpdateInfo{
		Available:      available,
		CurrentVersion: u.CurrentVersion,
		LatestVersion:  versionResp.Version,
		DownloadURL:    versionResp.DownloadURL,
		ReleaseNotes:   versionResp.ReleaseNotes,
	}, nil
}

// DownloadUpdate lädt ein verfügbares Update herunter (Stub)
func (u *Updater) DownloadUpdate(downloadURL string) error {
	// TODO: Implementierung für das Herunterladen und Installieren von Updates
	// Für Phase 1 nur ein Stub
	return fmt.Errorf("update download not implemented yet")
}

// compareVersions vergleicht zwei Versionsstrings
// Gibt -1 zurück wenn v1 < v2, 0 wenn v1 == v2, 1 wenn v1 > v2
func compareVersions(v1, v2 string) int {
	// Semantic Versioning Vergleich mit numerischem Parsing
	v1Parts := strings.Split(strings.TrimPrefix(v1, "v"), ".")
	v2Parts := strings.Split(strings.TrimPrefix(v2, "v"), ".")

	// Normalisiere auf gleiche Länge
	for len(v1Parts) < 3 {
		v1Parts = append(v1Parts, "0")
	}
	for len(v2Parts) < 3 {
		v2Parts = append(v2Parts, "0")
	}

	for i := 0; i < 3; i++ {
		n1, err1 := strconv.Atoi(v1Parts[i])
		n2, err2 := strconv.Atoi(v2Parts[i])
		if err1 != nil || err2 != nil {
			// Fallback auf String-Vergleich
			if v1Parts[i] < v2Parts[i] {
				return -1
			}
			if v1Parts[i] > v2Parts[i] {
				return 1
			}
			continue
		}
		if n1 < n2 {
			return -1
		}
		if n1 > n2 {
			return 1
		}
	}

	return 0
}