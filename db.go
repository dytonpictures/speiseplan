package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

var db *sqlx.DB

// InitDatabase initialisiert die SQLite-Datenbank
func InitDatabase() error {
	// DB-Datei im User-Home-Verzeichnis
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get user home directory: %w", err)
	}

	dbPath := filepath.Join(homeDir, "speiseplan.db")
	
	// Verbindung zur Datenbank herstellen
	database, err := sqlx.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	db = database

	// SQLite Pragmas setzen
	db.MustExec("PRAGMA journal_mode=WAL")
	db.MustExec("PRAGMA foreign_keys=ON")

	// Schema erstellen
	if err := createSchema(); err != nil {
		return fmt.Errorf("failed to create schema: %w", err)
	}

	// Seed-Daten einfügen
	if err := SeedDatabase(); err != nil {
		return fmt.Errorf("failed to seed database: %w", err)
	}

	return nil
}

// createSchema erstellt das Datenbankschema
func createSchema() error {
	schema := `
	-- 14 EU-Allergene (gesetzlich vorgeschrieben, LMIV Verordnung)
	CREATE TABLE IF NOT EXISTS allergens (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		category TEXT NOT NULL DEFAULT 'allergen'
	);

	-- Zusatzstoffe (deutsche Lebensmittelkennzeichnung)
	CREATE TABLE IF NOT EXISTS additives (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL
	);

	-- Produkte
	CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		multiline BOOLEAN DEFAULT FALSE
	);

	-- Produkt-Allergen-Zuordnung (n:m)
	CREATE TABLE IF NOT EXISTS product_allergens (
		product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
		allergen_id TEXT REFERENCES allergens(id),
		PRIMARY KEY (product_id, allergen_id)
	);

	-- Produkt-Zusatzstoff-Zuordnung (n:m)
	CREATE TABLE IF NOT EXISTS product_additives (
		product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
		additive_id TEXT REFERENCES additives(id),
		PRIMARY KEY (product_id, additive_id)
	);

	-- Wochenpläne
	CREATE TABLE IF NOT EXISTS week_plans (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		year INTEGER NOT NULL,
		week INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(year, week)
	);

	-- Einträge im Wochenplan
	CREATE TABLE IF NOT EXISTS plan_entries (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		week_plan_id INTEGER REFERENCES week_plans(id) ON DELETE CASCADE,
		day INTEGER NOT NULL,
		meal TEXT NOT NULL,
		slot INTEGER NOT NULL DEFAULT 0,
		product_id INTEGER REFERENCES products(id),
		custom_text TEXT,
		group_label TEXT
	);

	-- Sondertage
	CREATE TABLE IF NOT EXISTS special_days (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		week_plan_id INTEGER REFERENCES week_plans(id) ON DELETE CASCADE,
		day INTEGER NOT NULL,
		type TEXT NOT NULL,
		label TEXT
	);`

	_, err := db.Exec(schema)
	return err
}

// GetDB gibt die Datenbankverbindung zurück
func GetDB() *sqlx.DB {
	return db
}

// CloseDatabase schließt die Datenbankverbindung
func CloseDatabase() error {
	if db != nil {
		return db.Close()
	}
	return nil
}