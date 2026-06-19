package market

import (
	"time"
)

// MarketConfig mendefinisikan konfigurasi jam buka/tutup suatu market.
type MarketConfig struct {
	// Timezone adalah nama IANA timezone dari market ini (e.g. "Asia/Jakarta", "America/New_York").
	Timezone string

	// OpenHour & OpenMinute adalah jam buka market dalam timezone lokal market.
	OpenHour   int
	OpenMinute int

	// CloseHour & CloseMinute adalah jam tutup market dalam timezone lokal market.
	CloseHour   int
	CloseMinute int

	// HasLunchBreak menandakan apakah ada jeda makan siang (seperti IDX).
	HasLunchBreak bool
	// LunchStartMinute & LunchEndMinute dalam total menit dari tengah malam (00:00).
	// Hanya digunakan jika HasLunchBreak == true.
	LunchStartMinute int
	LunchEndMinute   int
}

// IDXConfig adalah konfigurasi jam market IDX (Indonesia Stock Exchange).
// Jam buka: 09:00–12:00 dan 13:30–16:00 WIB, Senin–Jumat.
var IDXConfig = MarketConfig{
	Timezone:         "Asia/Jakarta",
	OpenHour:         9,
	OpenMinute:       0,
	CloseHour:        16,
	CloseMinute:      0,
	HasLunchBreak:    true,
	LunchStartMinute: 12 * 60,       // 12:00
	LunchEndMinute:   13*60 + 30,    // 13:30
}

// USConfig adalah konfigurasi jam market NYSE/NASDAQ (US Stock Exchange).
// Jam buka: 09:30–16:00 ET, Senin–Jumat (tanpa jeda makan siang).
var USConfig = MarketConfig{
	Timezone:      "America/New_York",
	OpenHour:      9,
	OpenMinute:    30,
	CloseHour:     16,
	CloseMinute:   0,
	HasLunchBreak: false,
}

// IsMarketOpen mengecek apakah suatu market sedang buka berdasarkan konfigurasi
// yang diberikan, daftar hari libur, dan waktu saat ini.
func IsMarketOpen(config MarketConfig, holidays CheckedList, targetTime time.Time) bool {
	loc, err := time.LoadLocation(config.Timezone)
	if err != nil {
		// Fallback: anggap UTC jika timezone tidak valid
		loc = time.UTC
	}
	now := targetTime.In(loc)

	// Cek weekend
	weekday := now.Weekday()
	if weekday == time.Saturday || weekday == time.Sunday {
		return false
	}

	// Cek hari libur nasional (format: "DD-MM")
	dateStr := now.Format("02-01")
	if holidays[dateStr] {
		return false
	}

	// Cek jam buka/tutup
	hour := now.Hour()
	minute := now.Minute()
	totalMinutes := hour*60 + minute

	openTime := config.OpenHour*60 + config.OpenMinute
	closeTime := config.CloseHour*60 + config.CloseMinute

	if totalMinutes < openTime || totalMinutes >= closeTime {
		return false
	}

	// Cek jeda makan siang (opsional)
	if config.HasLunchBreak {
		if totalMinutes >= config.LunchStartMinute && totalMinutes < config.LunchEndMinute {
			return false
		}
	}

	return true
}

// IsIDXOpen adalah convenience wrapper untuk mengecek apakah IDX sedang buka.
func IsIDXOpen(holidays CheckedList, now time.Time) bool {
	return IsMarketOpen(IDXConfig, holidays, now)
}

// IsUSOpen adalah convenience wrapper untuk mengecek apakah US market sedang buka.
func IsUSOpen(holidays CheckedList, now time.Time) bool {
	return IsMarketOpen(USConfig, holidays, now)
}
