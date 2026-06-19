package market

import (
	"encoding/json"
	"fmt"
	"os"
)

// CheckedList adalah set tanggal libur dalam format "DD-MM"
type CheckedList map[string]bool

type holidayFile struct {
	Year2026 []string `json:"2026"`
}

// MarketHolidays menyimpan holiday list untuk semua market yang didukung.
type MarketHolidays struct {
	IDX CheckedList
	US  CheckedList
}

// loadHolidayFile membaca satu file JSON dan mengisi CheckedList.
func loadHolidayFile(path string) CheckedList {
	holidays := make(CheckedList)

	file, err := os.ReadFile(path)
	if err != nil {
		fmt.Println("[MARKET] Skipped holiday file (read error):", err)
		return holidays
	}

	var info holidayFile
	if err := json.Unmarshal(file, &info); err != nil {
		fmt.Println("[MARKET] Skipped holiday file (parse error):", err)
		return holidays
	}

	for _, date := range info.Year2026 {
		holidays[date] = true
	}

	return holidays
}

// LoadHolidays memuat holiday IDX dari satu path (backward-compat, hanya IDX).
func LoadHolidays(path string) CheckedList {
	return loadHolidayFile(path)
}

// LoadAllHolidays memuat holiday untuk semua market (IDX + US).
func LoadAllHolidays(idxPath string, usPath string) MarketHolidays {
	return MarketHolidays{
		IDX: loadHolidayFile(idxPath),
		US:  loadHolidayFile(usPath),
	}
}
