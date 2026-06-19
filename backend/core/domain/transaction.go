package domain

type Transaction struct {
	BaseModel
	OwnerID         uint64  `gorm:"not null;index" json:"owner_id"`
	TransactionType string  `gorm:"not null;default:'buy'" json:"transaction_type"`
	TransactionFee  float64 `gorm:"not null" json:"transaction_fee"`
	Quantity        float64 `gorm:"not null" json:"quantity"`
	BasePrice       float64 `gorm:"not null" json:"base_price"`
	Price           float64 `gorm:"not null" json:"price"`
	Ticker          string  `gorm:"not null" json:"ticker"`
	Title           string  `gorm:"type:varchar(255)" json:"title"`
	Notes           string  `gorm:"type:text" json:"notes"`
	Provider        string  `gorm:"type:varchar(50);index:idx_provider_account" json:"provider"`
	AccountNo       string  `gorm:"type:varchar(50);index:idx_provider_account" json:"account_no"`
}

type TransactionResponse struct {
	Transaction

	RealizedPnl    float64 `json:"realized_pnl"`
	EntryPriceUnit float64 `json:"entry_price_unit"`
	SellPriceUnit  float64 `json:"sell_price_unit"`
	Currency       string  `json:"currency"`
}

type TransactionUpdateReq struct {
	Title       string  `json:"title" validate:"gte=0,lte=50"`
	Notes       string  `json:"notes" validate:"gte=0,lte=255"`
	Price       float64 `json:"price" validate:"gte=0"`
	ReverseMode bool    `json:"reverse"`
}
