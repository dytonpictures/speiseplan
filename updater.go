package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
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
	Checksum     string `json:"checksum"`
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
		Checksum:       versionResp.Checksum,
	}, nil
}

// DownloadUpdate lädt ein verfügbares Update herunter und verifiziert die Checksum
func (u *Updater) DownloadUpdate(info UpdateInfo) (string, error) {
	if info.DownloadURL == "" {
		return "", fmt.Errorf("keine Download-URL vorhanden")
	}

	// Nur HTTPS erlauben
	if !strings.HasPrefix(info.DownloadURL, "https://") {
		return "", fmt.Errorf("nur HTTPS-Downloads sind erlaubt, URL: %s", info.DownloadURL)
	}

	// Temporäres Verzeichnis
	tmpDir, err := os.MkdirTemp("", "speiseplan-update-*")
	if err != nil {
		return "", fmt.Errorf("temporäres Verzeichnis konnte nicht erstellt werden: %w", err)
	}

	// Dateiname aus URL
	parts := strings.Split(info.DownloadURL, "/")
	filename := parts[len(parts)-1]
	if filename == "" {
		filename = "speiseplan-update.exe"
	}
	destPath := filepath.Join(tmpDir, filename)

	// Download
	resp, err := u.HTTPClient.Get(info.DownloadURL)
	if err != nil {
		return "", fmt.Errorf("Download fehlgeschlagen: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Download-Server antwortete mit Status %d", resp.StatusCode)
	}

	outFile, err := os.Create(destPath)
	if err != nil {
		return "", fmt.Errorf("Datei konnte nicht erstellt werden: %w", err)
	}
	defer outFile.Close()

	// Gleichzeitig schreiben und Hash berechnen
	hasher := sha256.New()
	writer := io.MultiWriter(outFile, hasher)

	if _, err := io.Copy(writer, resp.Body); err != nil {
		return "", fmt.Errorf("Download-Fehler: %w", err)
	}
	outFile.Close()

	// SHA256 verifizieren
	if info.Checksum != "" {
		actualHash := hex.EncodeToString(hasher.Sum(nil))
		expectedHash := strings.ToLower(strings.TrimSpace(info.Checksum))
		if actualHash != expectedHash {
			os.Remove(destPath)
			return "", fmt.Errorf("Checksum-Fehler: erwartet %s, erhalten %s", expectedHash, actualHash)
		}
	}

	msg := fmt.Sprintf("Update v%s wurde nach %s heruntergeladen. Bitte die App beenden und die neue Version starten.", info.LatestVersion, destPath)
	return msg, nil
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