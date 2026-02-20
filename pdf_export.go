package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/go-pdf/fpdf"
)

// ExportPDF exportiert einen Wochenplan als PDF im Querformat A4
func (a *App) ExportPDF(weekPlanID int, outputPath string) error {
	// Plan aus DB laden
	var plan WeekPlan
	err := db.Get(&plan, "SELECT id, year, week, created_at FROM week_plans WHERE id = ?", weekPlanID)
	if err != nil {
		return fmt.Errorf("Wochenplan nicht gefunden: %w", err)
	}

	entries, err := a.loadPlanEntries(plan.ID)
	if err != nil {
		return err
	}
	plan.Entries = entries

	specialDays, err := a.loadSpecialDays(plan.ID)
	if err != nil {
		return err
	}
	plan.SpecialDays = specialDays

	// Montag der KW berechnen
	monday := isoWeekMonday(plan.Year, plan.Week)
	friday := monday.AddDate(0, 0, 4)

	// PDF erstellen - Querformat A4
	pdf := fpdf.New("L", "mm", "A4", "")
	pdf.SetAutoPageBreak(false, 0)

	// UTF-8 Font für deutsche Umlaute
	pdf.AddUTF8Font("DejaVu", "", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
	pdf.AddUTF8Font("DejaVu", "B", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")

	pdf.AddPage()

	pageW, pageH := pdf.GetPageSize()
	marginX := 10.0
	usableW := pageW - 2*marginX

	// === ÜBERSCHRIFT ===
	pdf.SetFont("DejaVu", "B", 16)
	title := fmt.Sprintf("Wochenspeiseplan KW %d / %d", plan.Week, plan.Year)
	pdf.CellFormat(usableW, 10, title, "", 0, "C", false, 0, "")
	pdf.Ln(7)

	pdf.SetFont("DejaVu", "", 10)
	dateRange := fmt.Sprintf("%s – %s", monday.Format("02.01.2006"), friday.Format("02.01.2006"))
	pdf.CellFormat(usableW, 6, dateRange, "", 0, "C", false, 0, "")
	pdf.Ln(10)

	tableTop := pdf.GetY()

	// === TABELLE ===
	colW := usableW / 5.0
	dayNames := []string{"Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"}

	// Sondertage-Map
	specialMap := map[int]SpecialDay{}
	for _, sd := range plan.SpecialDays {
		specialMap[sd.Day] = sd
	}

	// Einträge nach Tag+Meal gruppieren
	type mealEntries struct {
		fruehstueck []PlanEntry
		vesper      []PlanEntry
	}
	dayEntries := map[int]*mealEntries{}
	for i := 1; i <= 5; i++ {
		dayEntries[i] = &mealEntries{}
	}
	for _, e := range plan.Entries {
		me := dayEntries[e.Day]
		if me == nil {
			continue
		}
		if e.Meal == "fruehstueck" {
			me.fruehstueck = append(me.fruehstueck, e)
		} else {
			me.vesper = append(me.vesper, e)
		}
	}

	// Allergene & Zusatzstoffe sammeln
	allergenSet := map[string]Allergen{}
	additiveSet := map[string]Additive{}
	for _, e := range plan.Entries {
		if e.Product != nil {
			for _, al := range e.Product.Allergens {
				allergenSet[al.ID] = al
			}
			for _, ad := range e.Product.Additives {
				additiveSet[ad.ID] = ad
			}
		}
	}

	// Kopfzeile: Tage
	headerH := 12.0
	pdf.SetFont("DejaVu", "B", 11)
	pdf.SetFillColor(220, 220, 220)
	for i, name := range dayNames {
		d := monday.AddDate(0, 0, i)
		label := fmt.Sprintf("%s, %s", name, d.Format("02.01."))
		x := marginX + float64(i)*colW
		pdf.SetXY(x, tableTop)
		pdf.CellFormat(colW, headerH, label, "1", 0, "C", true, 0, "")
	}
	pdf.Ln(-1)

	// Zeilen: Frühstück + Vesper
	mealLabels := []string{"Frühstück", "Vesper"}
	mealKeys := []string{"fruehstueck", "vesper"}

	// Berechne verfügbare Höhe für die 2 Mahlzeit-Zeilen
	legendEstimate := 30.0 // Platz für Legende + Footer
	availH := pageH - tableTop - headerH - legendEstimate
	rowH := availH / 2.0
	if rowH > 60 {
		rowH = 60
	}

	for mi, mealKey := range mealKeys {
		rowTop := tableTop + headerH + float64(mi)*rowH

		for day := 1; day <= 5; day++ {
			x := marginX + float64(day-1)*colW

			// Sondertag?
			if sd, ok := specialMap[day]; ok {
				pdf.SetFillColor(200, 200, 200)
				pdf.SetXY(x, rowTop)
				pdf.SetFont("DejaVu", "B", 10)
				label := sd.Type
				if sd.Label != nil && *sd.Label != "" {
					label = *sd.Label
				}
				if mi == 0 {
					pdf.CellFormat(colW, rowH, label, "1", 0, "C", true, 0, "")
				} else {
					pdf.CellFormat(colW, rowH, "", "1", 0, "C", true, 0, "")
				}
				continue
			}

			// Meal-Label
			pdf.SetFillColor(245, 245, 245)
			pdf.SetXY(x, rowTop)
			pdf.SetFont("DejaVu", "B", 9)
			pdf.CellFormat(colW, 6, mealLabels[mi], "LTR", 0, "C", true, 0, "")

			// Einträge
			me := dayEntries[day]
			var items []PlanEntry
			if mealKey == "fruehstueck" {
				items = me.fruehstueck
			} else {
				items = me.vesper
			}

			pdf.SetFont("DejaVu", "", 9)
			contentTop := rowTop + 6
			contentH := rowH - 6
			pdf.SetXY(x+1, contentTop)

			for _, item := range items {
				text := formatEntryText(item)
				pdf.SetX(x + 1)
				pdf.MultiCell(colW-2, 4, text, "", "L", false)
			}

			// Rahmen um die ganze Zelle
			pdf.Rect(x, rowTop, colW, rowH, "D")
			_ = contentH
		}
	}

	// === LEGENDE ===
	legendY := tableTop + headerH + 2*rowH + 3
	pdf.SetXY(marginX, legendY)

	if len(allergenSet) > 0 {
		pdf.SetFont("DejaVu", "B", 8)
		pdf.CellFormat(0, 4, "Allergene:", "", 0, "L", false, 0, "")
		pdf.Ln(4)
		pdf.SetFont("DejaVu", "", 7)
		var parts []string
		for id, al := range allergenSet {
			parts = append(parts, fmt.Sprintf("%s = %s", id, al.Name))
		}
		pdf.MultiCell(usableW, 3.5, strings.Join(parts, "  |  "), "", "L", false)
		pdf.Ln(1)
	}

	if len(additiveSet) > 0 {
		pdf.SetFont("DejaVu", "B", 8)
		pdf.CellFormat(0, 4, "Zusatzstoffe:", "", 0, "L", false, 0, "")
		pdf.Ln(4)
		pdf.SetFont("DejaVu", "", 7)
		var parts []string
		for id, ad := range additiveSet {
			parts = append(parts, fmt.Sprintf("%s = %s", id, ad.Name))
		}
		pdf.MultiCell(usableW, 3.5, strings.Join(parts, "  |  "), "", "L", false)
	}

	// === FOOTER ===
	pdf.SetFont("DejaVu", "", 8)
	footerY := pageH - 8
	pdf.SetXY(marginX, footerY)
	pdf.CellFormat(usableW/2, 5, fmt.Sprintf("Erstellt am %s", time.Now().Format("02.01.2006")), "", 0, "L", false, 0, "")
	pdf.CellFormat(usableW/2, 5, "Seite 1", "", 0, "R", false, 0, "")

	return pdf.OutputFileAndClose(outputPath)
}

// formatEntryText formatiert einen PlanEntry für die PDF-Ausgabe
func formatEntryText(e PlanEntry) string {
	var text string

	if e.Product != nil {
		text = e.Product.Name

		// Allergen/Zusatzstoff-Kürzel anhängen
		var codes []string
		for _, al := range e.Product.Allergens {
			codes = append(codes, al.ID)
		}
		for _, ad := range e.Product.Additives {
			codes = append(codes, ad.ID)
		}
		if len(codes) > 0 {
			text += " (" + strings.Join(codes, ",") + ")"
		}

		// Multiline: Inhaltsstoffe auf eigener Zeile
		if e.Product.Multiline && len(codes) > 0 {
			text = e.Product.Name + "\n  [" + strings.Join(codes, ",") + "]"
		}
	} else if e.CustomText != nil {
		text = *e.CustomText
	}

	// Gruppenlabel
	if e.GroupLabel != nil && *e.GroupLabel != "" {
		text = fmt.Sprintf("[%s] %s", *e.GroupLabel, text)
	}

	return text
}

// isoWeekMonday gibt den Montag der ISO-Kalenderwoche zurück
func isoWeekMonday(year, week int) time.Time {
	// 4. Januar liegt immer in KW 1
	jan4 := time.Date(year, 1, 4, 0, 0, 0, 0, time.Local)
	// Wochentag von 4. Jan (0=So, 1=Mo, ...)
	weekday := int(jan4.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	// Montag der KW 1
	mondayKW1 := jan4.AddDate(0, 0, -(weekday - 1))
	// Montag der gewünschten KW
	return mondayKW1.AddDate(0, 0, (week-1)*7)
}
