package main

import (
	"context"
	"fmt"
)

// App struct
type App struct {
	ctx     context.Context
	updater *Updater
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		updater: NewUpdater(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// PRODUKTE

// GetProducts gibt alle Produkte zurück
func (a *App) GetProducts() ([]Product, error) {
	query := `
		SELECT p.id, p.name, p.multiline
		FROM products p
		ORDER BY p.name
	`

	var products []Product
	err := db.Select(&products, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get products: %w", err)
	}

	// Allergene und Zusatzstoffe für jedes Produkt laden
	for i := range products {
		if err := loadProductRelations(&products[i]); err != nil {
			return nil, err
		}
	}

	return products, nil
}

// GetProduct gibt ein einzelnes Produkt zurück
func (a *App) GetProduct(id int) (*Product, error) {
	var product Product
	query := "SELECT id, name, multiline FROM products WHERE id = ?"
	err := db.Get(&product, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get product: %w", err)
	}

	if err := loadProductRelations(&product); err != nil {
		return nil, err
	}

	return &product, nil
}

// CreateProduct erstellt ein neues Produkt
func (a *App) CreateProduct(name string, multiline bool, allergenIDs []string, additiveIDs []string) (*Product, error) {
	tx, err := db.Beginx()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Produkt einfügen
	result, err := tx.Exec("INSERT INTO products (name, multiline) VALUES (?, ?)", name, multiline)
	if err != nil {
		return nil, fmt.Errorf("failed to insert product: %w", err)
	}

	productID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get product ID: %w", err)
	}

	// Allergene zuordnen
	for _, allergenID := range allergenIDs {
		_, err := tx.Exec("INSERT INTO product_allergens (product_id, allergen_id) VALUES (?, ?)", productID, allergenID)
		if err != nil {
			return nil, fmt.Errorf("failed to link allergen: %w", err)
		}
	}

	// Zusatzstoffe zuordnen
	for _, additiveID := range additiveIDs {
		_, err := tx.Exec("INSERT INTO product_additives (product_id, additive_id) VALUES (?, ?)", productID, additiveID)
		if err != nil {
			return nil, fmt.Errorf("failed to link additive: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return a.GetProduct(int(productID))
}

// UpdateProduct aktualisiert ein Produkt
func (a *App) UpdateProduct(id int, name string, multiline bool, allergenIDs []string, additiveIDs []string) (*Product, error) {
	tx, err := db.Beginx()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Produkt aktualisieren
	_, err = tx.Exec("UPDATE products SET name = ?, multiline = ? WHERE id = ?", name, multiline, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}

	// Alte Zuordnungen löschen
	_, err = tx.Exec("DELETE FROM product_allergens WHERE product_id = ?", id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete old allergen links: %w", err)
	}

	_, err = tx.Exec("DELETE FROM product_additives WHERE product_id = ?", id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete old additive links: %w", err)
	}

	// Neue Allergene zuordnen
	for _, allergenID := range allergenIDs {
		_, err := tx.Exec("INSERT INTO product_allergens (product_id, allergen_id) VALUES (?, ?)", id, allergenID)
		if err != nil {
			return nil, fmt.Errorf("failed to link allergen: %w", err)
		}
	}

	// Neue Zusatzstoffe zuordnen
	for _, additiveID := range additiveIDs {
		_, err := tx.Exec("INSERT INTO product_additives (product_id, additive_id) VALUES (?, ?)", id, additiveID)
		if err != nil {
			return nil, fmt.Errorf("failed to link additive: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return a.GetProduct(id)
}

// DeleteProduct löscht ein Produkt
func (a *App) DeleteProduct(id int) error {
	_, err := db.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}
	return nil
}

// ALLERGENE & ZUSATZSTOFFE

// GetAllergens gibt alle Allergene zurück
func (a *App) GetAllergens() ([]Allergen, error) {
	var allergens []Allergen
	err := db.Select(&allergens, "SELECT id, name, category FROM allergens ORDER BY id")
	if err != nil {
		return nil, fmt.Errorf("failed to get allergens: %w", err)
	}
	return allergens, nil
}

// GetAdditives gibt alle Zusatzstoffe zurück
func (a *App) GetAdditives() ([]Additive, error) {
	var additives []Additive
	err := db.Select(&additives, "SELECT id, name FROM additives ORDER BY id")
	if err != nil {
		return nil, fmt.Errorf("failed to get additives: %w", err)
	}
	return additives, nil
}

// WOCHENPLÄNE

// GetWeekPlan gibt einen Wochenplan zurück
func (a *App) GetWeekPlan(year int, week int) (*WeekPlan, error) {
	var plan WeekPlan
	query := "SELECT id, year, week, created_at FROM week_plans WHERE year = ? AND week = ?"
	err := db.Get(&plan, query, year, week)
	if err != nil {
		return nil, fmt.Errorf("failed to get week plan: %w", err)
	}

	// Einträge laden
	entries, err := a.loadPlanEntries(plan.ID)
	if err != nil {
		return nil, err
	}
	plan.Entries = entries

	// Sondertage laden
	specialDays, err := a.loadSpecialDays(plan.ID)
	if err != nil {
		return nil, err
	}
	plan.SpecialDays = specialDays

	return &plan, nil
}

// CreateWeekPlan erstellt einen neuen Wochenplan
func (a *App) CreateWeekPlan(year int, week int) (*WeekPlan, error) {
	_, err := db.Exec("INSERT INTO week_plans (year, week) VALUES (?, ?)", year, week)
	if err != nil {
		return nil, fmt.Errorf("failed to create week plan: %w", err)
	}

	return a.GetWeekPlan(year, week)
}

// CopyWeekPlan kopiert einen Wochenplan
func (a *App) CopyWeekPlan(sourceYear int, sourceWeek int, targetYear int, targetWeek int) (*WeekPlan, error) {
	// Erst Zielplan erstellen
	targetPlan, err := a.CreateWeekPlan(targetYear, targetWeek)
	if err != nil {
		return nil, err
	}

	// Quellplan laden
	sourcePlan, err := a.GetWeekPlan(sourceYear, sourceWeek)
	if err != nil {
		return nil, err
	}

	tx, err := db.Beginx()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Einträge kopieren
	for _, entry := range sourcePlan.Entries {
		_, err := tx.Exec(`
			INSERT INTO plan_entries (week_plan_id, day, meal, slot, product_id, custom_text, group_label)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, targetPlan.ID, entry.Day, entry.Meal, entry.Slot, entry.ProductID, entry.CustomText, entry.GroupLabel)
		if err != nil {
			return nil, fmt.Errorf("failed to copy plan entry: %w", err)
		}
	}

	// Sondertage kopieren
	for _, special := range sourcePlan.SpecialDays {
		_, err := tx.Exec(`
			INSERT INTO special_days (week_plan_id, day, type, label)
			VALUES (?, ?, ?, ?)
		`, targetPlan.ID, special.Day, special.Type, special.Label)
		if err != nil {
			return nil, fmt.Errorf("failed to copy special day: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return a.GetWeekPlan(targetYear, targetWeek)
}

// PLAN-EINTRÄGE

// AddPlanEntry fügt einen Planeintrag hinzu
func (a *App) AddPlanEntry(weekPlanID int, day int, meal string, productID *int, customText *string, groupLabel *string) (*PlanEntry, error) {
	// Nächste Slot-Nummer ermitteln
	var maxSlot int
	err := db.Get(&maxSlot, "SELECT COALESCE(MAX(slot), -1) FROM plan_entries WHERE week_plan_id = ? AND day = ? AND meal = ?", weekPlanID, day, meal)
	if err != nil {
		return nil, fmt.Errorf("failed to get max slot: %w", err)
	}

	slot := maxSlot + 1

	result, err := db.Exec(`
		INSERT INTO plan_entries (week_plan_id, day, meal, slot, product_id, custom_text, group_label)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, weekPlanID, day, meal, slot, productID, customText, groupLabel)
	if err != nil {
		return nil, fmt.Errorf("failed to add plan entry: %w", err)
	}

	entryID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get entry ID: %w", err)
	}

	return a.getPlanEntry(int(entryID))
}

// RemovePlanEntry entfernt einen Planeintrag
func (a *App) RemovePlanEntry(id int) error {
	_, err := db.Exec("DELETE FROM plan_entries WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to remove plan entry: %w", err)
	}
	return nil
}

// UpdatePlanEntry aktualisiert einen Planeintrag
func (a *App) UpdatePlanEntry(id int, productID *int, customText *string, groupLabel *string) (*PlanEntry, error) {
	_, err := db.Exec(`
		UPDATE plan_entries 
		SET product_id = ?, custom_text = ?, group_label = ?
		WHERE id = ?
	`, productID, customText, groupLabel, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update plan entry: %w", err)
	}

	return a.getPlanEntry(id)
}

// SONDERTAGE

// SetSpecialDay setzt einen Sondertag
func (a *App) SetSpecialDay(weekPlanID int, day int, dtype string, label string) error {
	_, err := db.Exec(`
		INSERT OR REPLACE INTO special_days (week_plan_id, day, type, label)
		VALUES (?, ?, ?, ?)
	`, weekPlanID, day, dtype, label)
	if err != nil {
		return fmt.Errorf("failed to set special day: %w", err)
	}
	return nil
}

// RemoveSpecialDay entfernt einen Sondertag
func (a *App) RemoveSpecialDay(weekPlanID int, day int) error {
	_, err := db.Exec("DELETE FROM special_days WHERE week_plan_id = ? AND day = ?", weekPlanID, day)
	if err != nil {
		return fmt.Errorf("failed to remove special day: %w", err)
	}
	return nil
}

// OTA UPDATE

// CheckForUpdate prüft auf verfügbare Updates
func (a *App) CheckForUpdate() (*UpdateInfo, error) {
	return a.updater.CheckForUpdate()
}

// HILFSFUNKTIONEN

// loadProductRelations lädt Allergene und Zusatzstoffe für ein Produkt
func loadProductRelations(product *Product) error {
	// Allergene laden
	allergenQuery := `
		SELECT a.id, a.name, a.category
		FROM allergens a
		JOIN product_allergens pa ON a.id = pa.allergen_id
		WHERE pa.product_id = ?
		ORDER BY a.id
	`
	err := db.Select(&product.Allergens, allergenQuery, product.ID)
	if err != nil {
		return fmt.Errorf("failed to load allergens for product %d: %w", product.ID, err)
	}

	// Zusatzstoffe laden
	additiveQuery := `
		SELECT a.id, a.name
		FROM additives a
		JOIN product_additives pa ON a.id = pa.additive_id
		WHERE pa.product_id = ?
		ORDER BY a.id
	`
	err = db.Select(&product.Additives, additiveQuery, product.ID)
	if err != nil {
		return fmt.Errorf("failed to load additives for product %d: %w", product.ID, err)
	}

	return nil
}

// loadPlanEntries lädt Einträge für einen Wochenplan
func (a *App) loadPlanEntries(weekPlanID int) ([]PlanEntry, error) {
	query := `
		SELECT pe.id, pe.week_plan_id, pe.day, pe.meal, pe.slot, 
			   pe.product_id, pe.custom_text, pe.group_label
		FROM plan_entries pe
		WHERE pe.week_plan_id = ?
		ORDER BY pe.day, pe.meal, pe.slot
	`

	var entries []PlanEntry
	err := db.Select(&entries, query, weekPlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to load plan entries: %w", err)
	}

	// Produkte laden
	for i := range entries {
		if entries[i].ProductID != nil {
			product, err := a.GetProduct(*entries[i].ProductID)
			if err != nil {
				return nil, err
			}
			entries[i].Product = product
		}
	}

	return entries, nil
}

// loadSpecialDays lädt Sondertage für einen Wochenplan
func (a *App) loadSpecialDays(weekPlanID int) ([]SpecialDay, error) {
	var specialDays []SpecialDay
	query := `
		SELECT id, week_plan_id, day, type, label
		FROM special_days
		WHERE week_plan_id = ?
		ORDER BY day
	`
	err := db.Select(&specialDays, query, weekPlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to load special days: %w", err)
	}
	return specialDays, nil
}

// getPlanEntry lädt einen einzelnen Planeintrag
func (a *App) getPlanEntry(id int) (*PlanEntry, error) {
	var entry PlanEntry
	query := `
		SELECT id, week_plan_id, day, meal, slot, product_id, custom_text, group_label
		FROM plan_entries
		WHERE id = ?
	`
	err := db.Get(&entry, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get plan entry: %w", err)
	}

	// Produkt laden wenn vorhanden
	if entry.ProductID != nil {
		product, err := a.GetProduct(*entry.ProductID)
		if err != nil {
			return nil, err
		}
		entry.Product = product
	}

	return &entry, nil
}
