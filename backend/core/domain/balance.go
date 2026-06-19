package domain

type Balance struct {
	BaseModel

	UserID    uint64  `gorm:"not null;uniqueIndex:idx_balance_account" json:"user_id"`
	Amount    float64 `gorm:"default:0;not null" json:"amount"`
	AssetType string  `gorm:"type:varchar(20);not null;default:'stock_balance';uniqueIndex:idx_balance_account" json:"asset_type"`
	Provider  string  `gorm:"type:varchar(50);uniqueIndex:idx_balance_account" json:"provider"`
	AccountNo string  `gorm:"type:varchar(50);uniqueIndex:idx_balance_account" json:"account_no"`
	Currency  string  `gorm:"type:varchar(10);not null;default:'IDR'" json:"currency"`
}

type BalanceResponse struct {
	CashBalance  float64 `json:"cash_balance"`
	StockBalance float64 `json:"stock_balance"`
}

type BalanceDetail struct {
	StockBalance float64 `json:"stock_balance"`
	CashBalance  float64 `json:"cash_balance"`
	TotalLiquid  float64 `json:"total_liquid"`
}

type AccountResponse struct {
	ProviderName string  `json:"provider_name"`
	AccountNo    string  `json:"account_no"`
	Currency     string  `json:"currency"`
	Amount       float64 `json:"amount"`
}

type BalanceUpdateReq struct {
	Amount     float64 `json:"amount" validate:"required,gt=0"`
	Fee        float64 `json:"fee" validate:"gte=0"`
	Mode       string  `json:"mode" validate:"required,oneof=add rem mod"`
	AssetType  string  `json:"asset_type" validate:"required,oneof=stock_balance cash_balance"`
	Note       string  `json:"note"`
	BankSource string  `json:"bank_src" validate:"required,gt=0,lt=18"`
	Title      string  `json:"title" validate:"lt=100"`
	Date       string  `json:"date"`
	Provider   string  `json:"provider" validate:"required"`
	AccountNo  string  `json:"account_no" validate:"required"`
	Currency   string  `json:"currency"`
}
