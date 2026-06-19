package worker

import (
	"fmt"
	"time"
	"trade-tracker/pkg/utils/market"

	"github.com/VYDev37/go-tvscanner-api/pkg/scanner"
)

// USStore adalah store terpisah untuk data saham US (NYSE/NASDAQ),
// sehingga tidak bentrok dengan scanner.GlobalStore yang dipakai IDX.
var USStore = &scanner.StockStore{}

// UpdateIDXStock memperbarui data saham IDX dari TradingView scanner.
// Mengembalikan false jika market sedang tutup dan bukan sesi init.
func UpdateIDXStock(holidays market.CheckedList, now time.Time, isInit bool) bool {
	if !market.IsIDXOpen(holidays, now) && !isInit {
		return false
	}

	opts := scanner.FetcherOptions{Market: "indonesia", Limit: 1000}
	data, err := scanner.FetchStockData(opts)
	if err == nil {
		scanner.GlobalStore.UpdateData(data)
		fmt.Println("[WORKER/IDX]: Stock data updated at", time.Now().Format("15:04:05"))
	} else {
		fmt.Println("[WORKER/IDX]: Failed to update stock data:", err)
	}

	return true
}

// UpdateUSStock memperbarui data saham US (NYSE/NASDAQ) dari TradingView scanner.
// Mengembalikan false jika market sedang tutup dan bukan sesi init.
func UpdateUSStock(holidays market.CheckedList, now time.Time, isInit bool) bool {
	if !market.IsUSOpen(holidays, now) && !isInit {
		return false
	}

	opts := scanner.FetcherOptions{Market: "america", Limit: 1000}
	data, err := scanner.FetchStockData(opts)
	if err == nil {
		USStore.UpdateData(data)
		fmt.Println("[WORKER/US]: Stock data updated at", time.Now().Format("15:04:05"))
	} else {
		fmt.Println("[WORKER/US]: Failed to update stock data:", err)
	}

	return true
}

// UpdateStock adalah alias backward-compatible untuk UpdateIDXStock.
// Deprecated: Gunakan UpdateIDXStock atau UpdateUSStock secara eksplisit.
func UpdateStock(holidays market.CheckedList, now time.Time, isInit bool) bool {
	return UpdateIDXStock(holidays, now, isInit)
}
