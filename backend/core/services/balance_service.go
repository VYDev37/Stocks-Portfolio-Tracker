package services

import (
	"fmt"
	"math"
	"strings"
	"time"

	"trade-tracker/core/domain"
	"trade-tracker/core/repositories"

	"gorm.io/gorm"

	"github.com/microcosm-cc/bluemonday"
)

type BalanceService interface {
	CreateBalance(balance *domain.Balance, trx *gorm.DB) error
	RemoveBalance(id uint64, userID uint64, trx *gorm.DB) error
	AdjustBalance(userID uint64, req domain.BalanceUpdateReq) error
	UpdateBalance(userID uint64, amount float64, assetType string, provider string, accountNo string, tx *gorm.DB) error

	GetBalanceByType(userID uint64, balanceType string, provider string, trx *gorm.DB) (float64, error)
	GetBalances(userID uint64, trx *gorm.DB) (*domain.BalanceResponse, error)
	GetAccountsByType(userID uint64, assetType string) ([]domain.AccountResponse, error)
	GetProviderAccount(userID uint64, assetType string, provider string, accountNo string, trx *gorm.DB) (*domain.Balance, error)
	MigrateBalances(userID uint64, provider string, accountNo string, tx *gorm.DB) error
}

type balanceService struct {
	repo        repositories.BalanceRepository
	tranService TransactionService
}

func NewBalanceService(repo repositories.BalanceRepository, tranService TransactionService) BalanceService {
	return &balanceService{repo: repo, tranService: tranService}
}

func (s *balanceService) CreateBalance(balance *domain.Balance, trx *gorm.DB) error {
	return s.repo.CreateBalance(balance, trx)
}

func (s *balanceService) RemoveBalance(id uint64, userID uint64, trx *gorm.DB) error {
	if balance, err := s.repo.GetBalance(id, trx); err != nil || balance.UserID != userID {
		return domain.ErrMismatchInfo
	}
	return s.repo.RemoveBalance(id, trx)
}

func (s *balanceService) UpdateBalance(userID uint64, amount float64, assetType string, provider string, accountNo string, tx *gorm.DB) error {
	if amount < 0 {
		current, _ := s.repo.GetBalanceByType(userID, assetType, provider, tx)
		if current < math.Abs(amount) {
			return domain.ErrInsufficientBalance
		}
	}
	return s.repo.UpdateBalance(&domain.Balance{
		UserID:    userID,
		Amount:    amount,
		AssetType: assetType,
		Provider:  provider,
		AccountNo: accountNo,
	}, tx)
}

func (s *balanceService) AdjustBalance(userID uint64, req domain.BalanceUpdateReq) error {
	db := s.repo.GetDB()

	return db.Transaction(func(tx *gorm.DB) error {
		var bal float64
		existingAcc, err := s.repo.GetProviderAccount(userID, req.AssetType, req.Provider, req.AccountNo, tx)
		if err != nil {
			return err
		}
		if existingAcc != nil {
			bal = existingAcc.Amount
		}

		now := time.Now()
		parsedDate, err := time.Parse("2006-01-02", req.Date)
		var finalDate time.Time

		if err == nil {
			if parsedDate.Format("2006-01-02") == now.Format("2006-01-02") {
				finalDate = now
			} else {
				finalDate = time.Date(
					parsedDate.Year(), parsedDate.Month(), parsedDate.Day(),
					now.Hour(), now.Minute(), now.Second(), now.Nanosecond(),
					now.Location(),
				)
			}
		} else {
			finalDate = now
		}

		var logged float64
		tType := "cashflow"

		switch strings.ToLower(req.Mode) {
		case "add":
			logged = req.Amount
			if req.AssetType == "cash_balance" {
				tType = "income"
			}
		case "rem":
			totalOut := req.Amount + req.Fee
			if bal < totalOut {
				return domain.ErrInsufficientBalance
			}
			logged = -totalOut
			if req.AssetType == "cash_balance" {
				tType = "expense"
			}
		case "mod":
			logged = req.Amount - bal
			tType = "adjust"
		}

		data, err := s.repo.GetProviderAccount(userID, req.AssetType, req.Provider, req.AccountNo, tx)
		if err != nil {
			return err
		}

		if data == nil {
			currency := req.Currency
			if currency == "" {
				currency = "IDR"
			}
			err := s.repo.CreateBalance(&domain.Balance{
				UserID:    userID,
				Amount:    req.Amount,
				AssetType: req.AssetType,
				Provider:  req.Provider,
				AccountNo: req.AccountNo,
				Currency:  currency,
			}, tx)

			if err != nil {
				return err
			}
		} else {
			if err := s.UpdateBalance(userID, logged, req.AssetType, req.Provider, req.AccountNo, tx); err != nil {
				return err
			}
		}

		p := bluemonday.StrictPolicy()
		req.Note = p.Sanitize(req.Note)
		note := req.Note
		if note == "" {
			note = fmt.Sprintf("%s via %s", strings.Title(req.Mode), req.BankSource)
		}

		title := req.Title
		if title == "" {
			title = fmt.Sprintf("%s %s", strings.Title(tType), req.AssetType)
		}

		return s.tranService.LogActivity(LogActivityParams{
			Position: &domain.Position{
				OwnerID: userID,
				Ticker:  req.BankSource,
			},
			Action:    tType,
			Title:     title,
			Price:     req.Amount,
			Fee:       req.Fee,
			Quantity:  0,
			BasePrice: 0,
			Notes:     note,
			Date:      finalDate,
			Provider:  req.Provider,
			AccountNo: req.AccountNo,
		}, tx)
	})
}

func (s *balanceService) GetBalanceByType(userID uint64, balanceType string, provider string, trx *gorm.DB) (float64, error) {
	return s.repo.GetBalanceByType(userID, balanceType, provider, trx)
}

func (s *balanceService) GetBalances(userID uint64, trx *gorm.DB) (*domain.BalanceResponse, error) {
	balances, err := s.repo.GetBalances(userID, trx)
	if err != nil {
		return nil, err
	}

	res := &domain.BalanceResponse{}
	for _, b := range balances {
		switch b.AssetType {
		case "stock_balance":
			res.StockBalance += b.Amount
		case "cash_balance":
			res.CashBalance += b.Amount
		}
	}

	return res, nil
}

func (s *balanceService) GetAccountsByType(userID uint64, assetType string) ([]domain.AccountResponse, error) {
	balances, err := s.repo.GetProviderAccounts(userID, assetType)
	if err != nil {
		return nil, err
	}

	return balances, nil
}

func (s *balanceService) GetProviderAccount(userID uint64, assetType string, provider string, accountNo string, trx *gorm.DB) (*domain.Balance, error) {
	return s.repo.GetProviderAccount(userID, assetType, provider, accountNo, trx)
}

func (s *balanceService) MigrateBalances(userID uint64, provider string, accountNo string, tx *gorm.DB) error {
	balances, err := s.repo.GetBalances(userID, tx)
	if err != nil {
		return err
	}

	for _, legacyBal := range balances {
		if legacyBal.Provider != "" {
			continue
		}
		targetBal, err := s.repo.GetProviderAccount(userID, legacyBal.AssetType, provider, accountNo, tx)
		if err != nil {
			return err
		}
		if targetBal != nil {
			targetBal.Amount += legacyBal.Amount
			if err := s.repo.SaveBalance(targetBal, tx); err != nil {
				return err
			}
			if err := s.repo.RemoveBalance(uint64(legacyBal.ID), tx); err != nil {
				return err
			}
		} else {
			legacyBal.Provider = provider
			legacyBal.AccountNo = accountNo
			if err := s.repo.SaveBalance(&legacyBal, tx); err != nil {
				return err
			}
		}
	}
	return nil
}

