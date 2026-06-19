package handlers

import (
	"fmt"
	"strings"
	"time"
	"trade-tracker/core/services"
	"trade-tracker/core/worker"
	"trade-tracker/pkg/utils/market"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
)

type AssetHandler struct {
	service  services.AssetService
	validate *validator.Validate
	holidays market.MarketHolidays
}

func NewAssetHandler(service services.AssetService) *AssetHandler {
	holidays := market.LoadAllHolidays("./holidays.json", "./holidays_us.json")
	return &AssetHandler{
		service:  service,
		validate: validator.New(),
		holidays: holidays,
	}
}

func (h *AssetHandler) HandleGetAssets(c fiber.Ctx) error {
	_, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	assetList := h.service.GetAssets()
	return c.Status(200).JSON(fiber.Map{"length": len(assetList), "data": assetList})
}

// HandleGetUSAssets mengembalikan daftar aset US (NYSE/NASDAQ) dari in-memory store.
func (h *AssetHandler) HandleGetUSAssets(c fiber.Ctx) error {
	_, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	assetList := h.service.GetUSAssets()
	return c.Status(200).JSON(fiber.Map{"length": len(assetList), "data": assetList})
}

// HandleGetAsset mengembalikan detail satu aset.
// Query param ?market=indonesia|america menentukan dari store mana data diambil.
func (h *AssetHandler) HandleGetAsset(c fiber.Ctx) error {
	ticker := strings.ToUpper(c.Params("ticker"))
	_, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	mkt := strings.ToLower(c.Query("market", "indonesia"))

	var (
		asset interface{}
		found bool
	)
	if mkt == "america" {
		asset, found = h.service.GetUSAsset(ticker)
	} else {
		asset, found = h.service.GetAsset(ticker)
	}

	if !found {
		return c.Status(404).JSON(fiber.Map{"message": "Not found."})
	}

	return c.Status(200).JSON(fiber.Map{"data": asset})
}

// HandleGetAssetChart mengembalikan data chart OHLCV untuk sebuah ticker.
// Query params:
//   - ?timeframe=1d|5d|1M|3M|... (default: "1M")
//   - ?market=indonesia|america   (default: "indonesia")
func (h *AssetHandler) HandleGetAssetChart(c fiber.Ctx) error {
	ticker := strings.ToUpper(c.Params("ticker"))
	_, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	timeframe := c.Query("timeframe")
	if timeframe == "" {
		timeframe = "1M"
	}

	mkt := strings.ToLower(c.Query("market", "america"))
	// fmt.Println(mkt, ticker)

	chartData, err := h.service.GetTickerChart(ticker, mkt, timeframe)
	if err != nil {
		fmt.Println(err)
		return c.Status(400).JSON(fiber.Map{"message": "Error bad request."})
	}

	return c.Status(200).JSON(fiber.Map{"data": chartData})
}

// HandleUpdateIDXStock me-trigger pembaruan data saham IDX secara manual.
func (h *AssetHandler) HandleUpdateIDXStock(c fiber.Ctx) error {
	now := h.parseTimeOrNow(c, "Asia/Jakarta")
	if now == nil {
		return c.Status(fiber.StatusBadRequest).SendString("Error: mismatch time format (use RFC3339 instead)")
	}

	if !worker.UpdateIDXStock(h.holidays.IDX, *now, false) {
		return c.Status(fiber.StatusOK).SendString(fmt.Sprintf(
			"[SKIP WORKER/IDX] Market closed at %s. (Causes no data to be changed.)",
			now.Format("2006-01-02 15:04:05"),
		))
	}

	return c.Status(fiber.StatusOK).SendString(fmt.Sprintf(
		"[SUCCESS WORKER/IDX] Stock data updated successfully at %s",
		now.Format("15:04:05"),
	))
}

// HandleUpdateUSStock me-trigger pembaruan data saham US secara manual.
func (h *AssetHandler) HandleUpdateUSStock(c fiber.Ctx) error {
	now := h.parseTimeOrNow(c, "America/New_York")
	if now == nil {
		return c.Status(fiber.StatusBadRequest).SendString("Error: mismatch time format (use RFC3339 instead)")
	}

	if !worker.UpdateUSStock(h.holidays.US, *now, false) {
		return c.Status(fiber.StatusOK).SendString(fmt.Sprintf(
			"[SKIP WORKER/US] Market closed at %s ET. (Causes no data to be changed.)",
			now.Format("2006-01-02 15:04:05"),
		))
	}

	return c.Status(fiber.StatusOK).SendString(fmt.Sprintf(
		"[SUCCESS WORKER/US] Stock data updated successfully at %s ET",
		now.Format("15:04:05"),
	))
}

// HandleUpdateStock adalah alias backward-compat untuk HandleUpdateIDXStock.
func (h *AssetHandler) HandleUpdateStock(c fiber.Ctx) error {
	return h.HandleUpdateIDXStock(c)
}

// parseTimeOrNow mem-parse RFC3339 time dari query param atau menggunakan time.Now().
// Mengembalikan nil jika ada error parsing.
func (h *AssetHandler) parseTimeOrNow(c fiber.Ctx, timezone string) *time.Time {
	loc, _ := time.LoadLocation(timezone)
	var t time.Time

	if time_ := c.Query("time"); time_ != "" {
		parsed, err := time.Parse(time.RFC3339, time_)
		if err != nil {
			return nil
		}
		t = parsed.In(loc)
	} else {
		t = time.Now().In(loc)
	}
	return &t
}
