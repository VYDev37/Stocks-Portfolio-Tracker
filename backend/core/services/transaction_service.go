package services

import (
	"time"
	"trade-tracker/core/domain"
	"trade-tracker/core/repositories"

	"gorm.io/gorm"
)

type TransactionService interface {
	LogActivity(params LogActivityParams, txx *gorm.DB) error
	GetLocalTransactions(userID uint64) ([]domain.TransactionResponse, error)
	UpdateTransaction(id uint, userID uint64, req domain.TransactionUpdateReq) error
	MigrateTransactions(userID uint64, provider string, accountNo string, transactionIDs []uint) error
	MigrateTradingTransactions(userID uint64, provider string, accountNo string, tx *gorm.DB) error
}

type transactionService struct {
	repo    repositories.TransactionRepository
	balRepo repositories.BalanceRepository
}

type LogActivityParams struct {
	Position  *domain.Position
	Quantity  float64
	Price     float64
	Fee       float64
	BasePrice float64
	Action    string
	Notes     string
	Title     string
	Date      time.Time
	Provider  string
	AccountNo string
}

func NewTransactionService(repo repositories.TransactionRepository, balRepo repositories.BalanceRepository) TransactionService {
	return &transactionService{repo: repo, balRepo: balRepo}
}

func (s *transactionService) LogActivity(params LogActivityParams, tx *gorm.DB) error {
	log := &domain.Transaction{
		BaseModel: domain.BaseModel{
			CreatedAt: params.Date,
		},
		OwnerID:         params.Position.OwnerID,
		Ticker:          params.Position.Ticker,
		TransactionType: params.Action,
		Quantity:        params.Quantity,
		Price:           params.Price,
		BasePrice:       params.BasePrice,
		TransactionFee:  params.Fee,
		Notes:           params.Notes,
		Title:           params.Title,
		Provider:        params.Provider,
		AccountNo:       params.AccountNo,
	}

	err := s.repo.AddTransaction(log, tx)
	if err != nil {
		return err
	}

	return nil
}

func (s *transactionService) GetLocalTransactions(userID uint64) ([]domain.TransactionResponse, error) {
	var result []domain.TransactionResponse
	trans, err := s.repo.GetTransactions(userID)
	if err != nil {
		return nil, err
	}

	balances, err := s.balRepo.GetBalances(userID, nil)
	if err != nil {
		return nil, err
	}

	// Create a lookup map for currency by provider + account_no
	currencyMap := make(map[string]string)
	for _, b := range balances {
		key := b.Provider + ":" + b.AccountNo
		if b.Currency != "" {
			currencyMap[key] = b.Currency
		}
	}

	for _, t := range trans {
		isTrade := t.TransactionType == "sell" || t.TransactionType == "buy"
		if isTrade && t.Quantity <= 0 {
			continue
		}

		realizedPnl := t.Price - t.BasePrice - t.TransactionFee
		if t.TransactionType != "sell" {
			realizedPnl = 0
		}

		var entryPU, sellPU float64
		//if t.TransactionType == "cashflow" || t.TransactionType == "expense" || t.TransactionType == "income"
		if isTrade {
			entryPU = t.BasePrice / t.Quantity
		}
		if t.TransactionType == "sell" {
			sellPU = t.Price / t.Quantity
		}

		// Resolve currency
		currency := "IDR"
		key := t.Provider + ":" + t.AccountNo
		if val, exists := currencyMap[key]; exists {
			currency = val
		} else {
			// Fallback: search for any balance of this provider for the user
			if t.Provider != "" {
				for _, b := range balances {
					if b.Provider == t.Provider && b.Currency != "" {
						currency = b.Currency
						break
					}
				}
			} else {
				// If provider is empty, check if there's any balance with empty provider
				for _, b := range balances {
					if b.Provider == "" && b.Currency != "" {
						currency = b.Currency
						break
					}
				}
			}
		}

		result = append(result, domain.TransactionResponse{
			Transaction:    t,
			EntryPriceUnit: entryPU,
			SellPriceUnit:  sellPU,
			RealizedPnl:    realizedPnl,
			Currency:       currency,
		})
	}

	return result, nil
}

func (s *transactionService) UpdateTransaction(id uint, userID uint64, req domain.TransactionUpdateReq) error {
	db := s.repo.GetDB()

	return db.Transaction(func(tx *gorm.DB) error {
		trx, err := s.repo.GetTransactionByID(id, tx)
		if err != nil {
			return domain.ErrItemNotFound
		}

		if trx.OwnerID != userID || (trx.TransactionType != "income" && trx.TransactionType != "expense") {
			return domain.ErrMismatchInfo
		}

		if req.ReverseMode {
			if trx.TransactionType == "income" {
				trx.TransactionType = "expense"
			} else {
				trx.TransactionType = "income"
			}
		}

		delta := trx.Price - req.Price
		if trx.TransactionType == "expense" {
			delta *= -1
		}

		bal, err := s.balRepo.GetBalanceByType(userID, "cash_balance", trx.Provider, tx)
		if err != nil {
			return err
		}

		if bal+delta < 0 {
			return domain.ErrInsufficientBalance
		}

		if err := s.balRepo.UpdateBalance(&domain.Balance{
			UserID:    userID,
			AssetType: "cash_balance",
			Amount:    delta,
			Provider:  trx.Provider,
		}, tx); err != nil {
			return err
		}

		trx.Title = req.Title
		trx.Notes = req.Notes
		trx.Price = req.Price

		return s.repo.UpdateTransaction(trx, tx)
	})
}

func (s *transactionService) MigrateTransactions(userID uint64, provider string, accountNo string, transactionIDs []uint) error {
	db := s.repo.GetDB()
	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.MigrateNonTradingTransactions(userID, provider, accountNo, transactionIDs, tx); err != nil {
			return err
		}

		// 2. Adjust Balance.
		var totalAmount float64
		txs, err := s.repo.GetTransactionsByIDsAndTypes(userID, transactionIDs, []string{"income", "expense"}, tx)
		if err != nil {
			return err
		}

		for _, transaction := range txs {
			if transaction.TransactionType == "income" {
				totalAmount += transaction.Price
			} else if transaction.TransactionType == "expense" {
				totalAmount -= (transaction.Price + transaction.TransactionFee)
			}
		}

		if totalAmount != 0 {
			// Deduct from default balance
			var defaultBal domain.Balance
			err := tx.Where("user_id = ? AND asset_type = ? AND (provider = ? OR provider IS NULL)", userID, "cash_balance", "").First(&defaultBal).Error
			if err == nil {
				defaultBal.Amount -= totalAmount
				if err := tx.Save(&defaultBal).Error; err != nil {
					return err
				}
			}

			// Add to target balance
			var targetBal domain.Balance
			err = tx.Where("user_id = ? AND asset_type = ? AND provider = ? AND account_no = ?", userID, "cash_balance", provider, accountNo).First(&targetBal).Error
			if err == nil {
				targetBal.Amount += totalAmount
				if err := tx.Save(&targetBal).Error; err != nil {
					return err
				}
			} else if gorm.ErrRecordNotFound == err {
				newBal := domain.Balance{
					UserID:    userID,
					AssetType: "cash_balance",
					Provider:  provider,
					AccountNo: accountNo,
					Amount:    totalAmount,
				}
				if err := tx.Create(&newBal).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		}

		return nil
	})
}

func (s *transactionService) MigrateTradingTransactions(userID uint64, provider string, accountNo string, tx *gorm.DB) error {
	return s.repo.MigrateTradingTransactions(userID, provider, accountNo, tx)
}
