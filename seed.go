package main

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

//go:embed products_export.json
var productsJSON []byte

// SeedDatabase fügt Seed-Daten in die Datenbank ein
func SeedDatabase() error {
	// Prüfen ob bereits Seeds vorhanden sind
	var count int
	err := db.Get(&count, "SELECT COUNT(*) FROM allergens")
	if err != nil {
		return fmt.Errorf("failed to check for existing allergens: %w", err)
	}

	// Nur seeden wenn noch keine Daten vorhanden sind
	if count > 0 {
		return nil // Bereits geseedet
	}

	// Allergene seeden
	if err := seedAllergens(); err != nil {
		return fmt.Errorf("failed to seed allergens: %w", err)
	}

	// Zusatzstoffe seeden
	if err := seedAdditives(); err != nil {
		return fmt.Errorf("failed to seed additives: %w", err)
	}

	// Produkte seeden
	if err := seedProducts(); err != nil {
		return fmt.Errorf("failed to seed products: %w", err)
	}

	return nil
}

// seedAllergens fügt die 14 EU-Allergene ein
func seedAllergens() error {
	allergens := []Allergen{
		{"a", "glutenhaltiges Getreide (Weizen, Roggen, Gerste, Hafer, Dinkel, Kamut)", "allergen"},
		{"b", "Krebstiere", "allergen"},
		{"c", "Eier", "allergen"},
		{"d", "Fisch", "allergen"},
		{"e", "Erdnüsse", "allergen"},
		{"f", "Soja(bohnen)", "allergen"},
		{"g", "Milch (einschließlich Laktose)", "allergen"},
		{"h", "Schalenfrüchte (Mandeln, Haselnüsse, Walnüsse, Cashew, Pecan, Paranüsse, Pistazien, Macadamia)", "allergen"},
		{"i", "Sellerie", "allergen"},
		{"j", "Senf", "allergen"},
		{"k", "Sesamsamen", "allergen"},
		{"l", "Schwefeldioxid und Sulfite (> 10 mg/kg oder mg/l)", "allergen"},
		{"m", "Lupine", "allergen"},
		{"n", "Weichtiere", "allergen"},
	}

	for _, allergen := range allergens {
		_, err := db.NamedExec(
			"INSERT OR IGNORE INTO allergens (id, name, category) VALUES (:id, :name, :category)",
			allergen,
		)
		if err != nil {
			return fmt.Errorf("failed to insert allergen %s: %w", allergen.ID, err)
		}
	}

	return nil
}

// seedAdditives fügt die deutschen Zusatzstoffe ein
func seedAdditives() error {
	additives := []Additive{
		{"A", "Antioxidationsmittel"},
		{"B", "Backtriebmittel"},
		{"E", "Emulgator"},
		{"F", "Farbstoff"},
		{"FM", "Festigungsmittel"},
		{"FH", "Feuchthaltemittel"},
		{"FÜ", "Füllstoff"},
		{"G", "Geliermittel"},
		{"GV", "Geschmacksverstärker"},
		{"K", "Konservierungsstoff"},
		{"M", "Mehlbehandlungsmittel"},
		{"MS", "Modifizierte Stärke"},
		{"R", "Rieselhilfe"},
		{"S", "Säuerungsmittel"},
		{"SR", "Säureregulator"},
		{"SV", "Schaumverhüter"},
		{"SCH", "Schmelzsalz"},
		{"ST", "Stabilisator"},
		{"SÜ", "Süßungsmittel"},
		{"T", "Trägerstoff"},
		{"TG", "Treibgas"},
		{"TM", "Trennmittel"},
		{"Ü", "Überzugsmittel"},
		{"V", "Verdickungsmittel"},
	}

	for _, additive := range additives {
		_, err := db.NamedExec(
			"INSERT OR IGNORE INTO additives (id, name) VALUES (:id, :name)",
			additive,
		)
		if err != nil {
			return fmt.Errorf("failed to insert additive %s: %w", additive.ID, err)
		}
	}

	return nil
}

// seedProducts importiert Produkte aus der JSON-Datei
func seedProducts() error {
	var imports []ProductImport
	if err := json.Unmarshal(productsJSON, &imports); err != nil {
		return fmt.Errorf("failed to parse products JSON: %w", err)
	}

	tx, err := db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, product := range imports {
		// Produkt einfügen
		result, err := tx.NamedExec(
			"INSERT OR IGNORE INTO products (name, multiline) VALUES (:name, :multiline)",
			map[string]interface{}{
				"name":      product.Name,
				"multiline": product.Multiline,
			},
		)
		if err != nil {
			return fmt.Errorf("failed to insert product %s: %w", product.Name, err)
		}

		// Produkt-ID ermitteln
		var productID int64
		if productID, err = result.LastInsertId(); err != nil {
			// Wenn INSERT OR IGNORE nichts eingefügt hat, ID über SELECT holen
			err = tx.Get(&productID, "SELECT id FROM products WHERE name = ?", product.Name)
			if err != nil {
				return fmt.Errorf("failed to get product ID for %s: %w", product.Name, err)
			}
		}

		// Allergene und Zusatzstoffe parsen und zuordnen
		allergenIDs, additiveIDs := parseAllergenData(product.Allergens1, product.Allergens2)

		// Allergene zuordnen
		for _, allergenID := range allergenIDs {
			_, err := tx.Exec(
				"INSERT OR IGNORE INTO product_allergens (product_id, allergen_id) VALUES (?, ?)",
				productID, allergenID,
			)
			if err != nil {
				return fmt.Errorf("failed to link allergen %s to product %s: %w", allergenID, product.Name, err)
			}
		}

		// Zusatzstoffe zuordnen
		for _, additiveID := range additiveIDs {
			_, err := tx.Exec(
				"INSERT OR IGNORE INTO product_additives (product_id, additive_id) VALUES (?, ?)",
				productID, additiveID,
			)
			if err != nil {
				return fmt.Errorf("failed to link additive %s to product %s: %w", additiveID, product.Name, err)
			}
		}
	}

	return tx.Commit()
}

// parseAllergenData parst Allergen- und Zusatzstoff-Daten aus den Import-Feldern
func parseAllergenData(allergens1, allergens2 string) ([]string, []string) {
	// Beide Felder zusammenführen
	combined := strings.TrimSpace(allergens1 + ", " + allergens2)
	if combined == ", " {
		return nil, nil
	}

	// Regex für Allergene (einzelne Kleinbuchstaben a-n)
	allergenRegex := regexp.MustCompile(`\b[a-n]\b`)
	// Regex für Zusatzstoffe (Großbuchstaben und Kürzel)
	additiveRegex := regexp.MustCompile(`\b[A-Z]{1,3}\b`)

	allergenMatches := allergenRegex.FindAllString(combined, -1)
	additiveMatches := additiveRegex.FindAllString(combined, -1)

	// Duplikate entfernen
	allergenIDs := removeDuplicates(allergenMatches)
	additiveIDs := removeDuplicates(additiveMatches)

	return allergenIDs, additiveIDs
}

// removeDuplicates entfernt Duplikate aus einem String-Slice
func removeDuplicates(slice []string) []string {
	seen := make(map[string]bool)
	result := []string{}

	for _, item := range slice {
		if !seen[item] {
			seen[item] = true
			result = append(result, item)
		}
	}

	return result
}