package domain

import (
	"time"
)

type Position struct {
	BaseModel

	OwnerID           uint64  `gorm:"not null;index;"`
	Ticker            string  `gorm:"not null;index;" json:"ticker"`
	TotalQty          float64 `gorm:"not null" json:"total_qty"` // bisa aja untuk crypto
	InvestedTotal     float64 `gorm:"not null" json:"invested_total"`
	PositionType      string  `gorm:"type:varchar(20);not null;default:'stocks'" json:"position_type"`    // stocks (IDX) / stocks_us (NYSE/NASDAQ) / crypto / futures
	PositionDirection string  `gorm:"type:varchar(10);not null;default:'LONG'" json:"position_direction"` // LONG / SHORT
	TakeProfit        float64 `json:"tp_position"`
	StopLoss          float64 `json:"sl_position"`
	Provider          string  `gorm:"type:varchar(20)" json:"provider"`
	AccountNo         string  `gorm:"type:varchar(20)" json:"account_no"`
}

// Issue (titip sini): Ketika add stocks_us balance, malah ga masuk ke db?
type PositionAddReq struct {
	Ticker        string  `json:"ticker" validate:"required,min=1,max=10"`
	PositionType  string  `json:"position_type" validate:"required,oneof=stocks stocks_us futures"`
	TotalQty      float64 `json:"total_qty" validate:"required,gt=0"`
	InvestedTotal float64 `json:"invested_total" validate:"required,gt=0"` // avg price to add (ex: buy 3 lot BBRI for 800k IDR, avg += 800k, qty += 3)
	Fee           float64 `json:"fee" validate:"gte=0"`
	Notes         string  `json:"notes" validate:"max=255"`
	Provider      string  `json:"provider" validate:"required"`
	AccountNo     string  `json:"account_no" validate:"required"`
}

type PortfolioItem struct {
	Ticker             string    `json:"ticker"`
	TotalQty           float64   `json:"total_qty"`
	InvestedTotal      float64   `json:"invested_total"`
	CurrentMarketPrice float64   `json:"current_price"`
	UnrealizedPnL      float64   `json:"unrealized_pnl"`
	PnLPercentage      float64   `json:"pnl_percentage"`
	UpdatedAt          time.Time `json:"updated_at"`
	Provider           string    `json:"provider"`
	AccountNo          string    `json:"account_no"`
	Currency           string    `json:"currency"`
}

type PortfolioResponse struct {
	Items          []PortfolioItem `json:"items"`
	TotalEquityIDR float64         `json:"total_equity_idr"`
	TotalEquityUSD float64         `json:"total_equity_usd"`
}
