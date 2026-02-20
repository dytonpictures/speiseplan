package main

import (
	"time"
)

// Allergen repräsentiert ein EU-Allergen (a-n)
type Allergen struct {
	ID   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Category string `json:"category" db:"category"`
}

// Additive repräsentiert einen Zusatzstoff (A, B, E, F, etc.)
type Additive struct {
	ID   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

// Product repräsentiert ein Produkt mit Allergenen und Zusatzstoffen
type Product struct {
	ID        int        `json:"id" db:"id"`
	Name      string     `json:"name" db:"name"`
	Multiline bool       `json:"multiline" db:"multiline"`
	Allergens []Allergen `json:"allergens"`
	Additives []Additive `json:"additives"`
}

// WeekPlan repräsentiert einen Wochenplan
type WeekPlan struct {
	ID        int         `json:"id" db:"id"`
	Year      int         `json:"year" db:"year"`
	Week      int         `json:"week" db:"week"`
	CreatedAt time.Time   `json:"created_at" db:"created_at"`
	Entries   []PlanEntry `json:"entries"`
	SpecialDays []SpecialDay `json:"special_days"`
}

// PlanEntry repräsentiert einen Eintrag im Wochenplan
type PlanEntry struct {
	ID         int      `json:"id" db:"id"`
	WeekPlanID int      `json:"week_plan_id" db:"week_plan_id"`
	Day        int      `json:"day" db:"day"` // 1=Mo, 2=Di, 3=Mi, 4=Do, 5=Fr
	Meal       string   `json:"meal" db:"meal"` // 'fruehstueck' oder 'vesper'
	Slot       int      `json:"slot" db:"slot"` // Reihenfolge innerhalb des Tages
	ProductID  *int     `json:"product_id" db:"product_id"`
	Product    *Product `json:"product,omitempty"`
	CustomText *string  `json:"custom_text" db:"custom_text"`
	GroupLabel *string  `json:"group_label" db:"group_label"` // 'Krippe', 'Kita', 'Hort', etc.
}

// SpecialDay repräsentiert einen Sondertag (Feiertag, Schließtag, etc.)
type SpecialDay struct {
	ID         int    `json:"id" db:"id"`
	WeekPlanID int    `json:"week_plan_id" db:"week_plan_id"`
	Day        int    `json:"day" db:"day"` // 1=Mo, 2=Di, ...
	Type       string `json:"type" db:"type"` // 'feiertag' oder 'schliesstag'
	Label      *string `json:"label" db:"label"` // z.B. "Neujahr", "Teamtag"
}

// UpdateInfo repräsentiert Informationen über verfügbare Updates
type UpdateInfo struct {
	Available      bool   `json:"available"`
	CurrentVersion string `json:"current_version"`
	LatestVersion  string `json:"latest_version"`
	DownloadURL    string `json:"download_url,omitempty"`
	ReleaseNotes   string `json:"release_notes,omitempty"`
}

// ProductImport repräsentiert ein Produkt beim Import aus JSON
type ProductImport struct {
	Name       string `json:"name"`
	Multiline  bool   `json:"multiline"`
	Allergens1 string `json:"allergens1"`
	Allergens2 string `json:"allergens2"`
}