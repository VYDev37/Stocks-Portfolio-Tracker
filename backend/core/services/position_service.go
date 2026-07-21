package services

import (
	"errors"
	"fmt"
	"strings"

	"stocks-portfolio-tracker/core/domain"
	"stocks-portfolio-tracker/core/integrations/providers"
	"stocks-portfolio-tracker/core/repositories"
	"stocks-portfolio-tracker/pkg/utils/format"

	"gorm.io/gorm"
)

// resolveMarket menentukan nama market (untuk Yahoo Finance) berdasarkan position_type.
// "stocks"    â†’ IDX (Indonesia, suffix .JK)
// "stocks_us" â†’ US (NYSE/NASDAQ, tanpa suffix)
// lainnya     â†’ IDX sebagai default
func resolveMarket(positionType string) string {
	switch strings.ToLower(positionType) {
	case "stocks_us":
		return "america"
	default:
		return "indonesia"
	}
}

type PositionService interface {
	AddPosition(directionType string, pos *domain.Position, fee float64) error

	GetPositions(userID uint64) ([]domain.Position, error)
	GetPortfolio(userID uint64) (*domain.PortfolioResponse, error)
	GetTickerCurrentPrice(ticker string, market string) (float64, error)
	MigratePositions(userID uint64, provider string, accountNo string) error
}

type positionService struct {
	repo     repositories.PositionRepository
	uRepo    repositories.UserRepository
	provider providers.PriceProvider

	balService         BalanceService
	transactionService TransactionService
}

func NewPositionService(
	repo repositories.PositionRepository,
	uRepo repositories.UserRepository,
	provider providers.PriceProvider,
	transactionService TransactionService,
	balService BalanceService,
) PositionService {
	return &positionService{
		repo:               repo,
		uRepo:              uRepo,
		provider:           provider,
		transactionService: transactionService,
		balService:         balService,
	}
}

func (s *positionService) handleSellMode(existing *domain.Position, sellData *domain.Position, fee float64, tx *gorm.DB) error {
	if existing == nil || existing.ID == 0 || existing.TotalQty < sellData.TotalQty {
		return domain.ErrInsufficientAmount
	}

	if existing.OwnerID != sellData.OwnerID {
		return domain.ErrMismatchInfo
	}

	basePrice := (existing.InvestedTotal / existing.TotalQty) * sellData.TotalQty
	if sellData.TotalQty >= existing.TotalQty {
		basePrice = existing.InvestedTotal
	}

	if err := s.balService.UpdateBalance(existing.OwnerID, sellData.InvestedTotal-fee, "stock_balance", sellData.Provider, sellData.AccountNo, tx); err != nil {
		return domain.ErrInternalServerError
	}

	existing.InvestedTotal -= basePrice
	existing.TotalQty -= sellData.TotalQty

	if existing.TotalQty <= 0 {
		if err := s.repo.RemovePosition(existing.ID, tx); err != nil {
			return err
		}
	} else {
		if err := s.repo.UpdatePosition(existing, tx); err != nil {
			return err
		}
	}

	return s.transactionService.LogActivity(LogActivityParams{
		Position:  existing,
		Quantity:  sellData.TotalQty,
		Price:     sellData.InvestedTotal,
		Fee:       fee,
		BasePrice: basePrice,
		Action:    "sell",
		Notes:     fmt.Sprintf("Sold %.f lot of %s for %s.", sellData.TotalQty, sellData.Ticker, format.FormatNumber(sellData.InvestedTotal)),
		Title:     "",
		Provider:  sellData.Provider,
		AccountNo: sellData.AccountNo,
	}, tx)
}

func (s *positionService) handleBuyMode(existing *domain.Position, buyData *domain.Position, fee float64, tx *gorm.DB) error {
	accBal, err := s.balService.GetProviderAccount(buyData.OwnerID, "stock_balance", buyData.Provider, buyData.AccountNo, tx)
	if err != nil {
		return err
	}
	var balance float64
	if accBal != nil {
		balance = accBal.Amount
	}

	if balance < (buyData.InvestedTotal + fee) {
		return domain.ErrInsufficientBalance
	}

	if err := s.balService.UpdateBalance(buyData.OwnerID, -(buyData.InvestedTotal + fee), "stock_balance", buyData.Provider, buyData.AccountNo, tx); err != nil {
		return err
	}

	if existing != nil {
		if existing.OwnerID != buyData.OwnerID {
			return domain.ErrMismatchInfo
		}

		existing.TotalQty += buyData.TotalQty
		existing.InvestedTotal += buyData.InvestedTotal

		if err := s.repo.UpdatePosition(existing, tx); err != nil {
			return err
		}
	} else {
		if err := s.repo.AddPosition(buyData, tx); err != nil {
			return err
		}
	}

	return s.transactionService.LogActivity(LogActivityParams{
		Position:  buyData,
		Quantity:  buyData.TotalQty,
		Price:     buyData.InvestedTotal + fee,
		Fee:       fee,
		BasePrice: buyData.InvestedTotal,
		Action:    "buy",
		Notes:     fmt.Sprintf("Bought %.f lot of %s for %s.", buyData.TotalQty, buyData.Ticker, format.FormatNumber(buyData.InvestedTotal)),
		Title:     "",
		Provider:  buyData.Provider,
		AccountNo: buyData.AccountNo,
	}, tx)
}

func (s *positionService) AddPosition(directionType string, pos *domain.Position, fee float64) error {
	directionType = strings.ToLower(directionType)

	pos.PositionType = strings.ToLower(pos.PositionType)
	pos.Ticker = strings.ToUpper(pos.Ticker)

	posMarket := resolveMarket(pos.PositionType)
	if _, err := s.provider.GetCurrentPrice(pos.Ticker, posMarket); err != nil {
		return domain.ErrItemNotFound
	}

	if pos.TotalQty <= 0 {
		return domain.ErrInsufficientAmount
	}

	if directionType != "sell" && directionType != "buy" {
		directionType = "buy"
	}

	db := s.repo.GetDB()
	return db.Transaction(func(tx *gorm.DB) error {
		existing, err := s.repo.GetPosByTicker(pos.OwnerID, pos.Ticker, pos.Provider, pos.AccountNo, tx)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		if pos.PositionType == "stocks" {
			pos.TotalQty *= 100
		}

		if directionType == "sell" {
			return s.handleSellMode(existing, pos, fee, tx)
		}

		return s.handleBuyMode(existing, pos, fee, tx)
	})
}

func (s *positionService) GetPositions(userID uint64) ([]domain.Position, error) {
	return s.repo.GetPositions(userID)
}

func (s *positionService) GetPortfolio(userID uint64) (*domain.PortfolioResponse, error) {
	positions, err := s.repo.GetPositions(userID)
	if err != nil {
		return nil, err
	}

	// Kelompokkan ticker berdasarkan market untuk batch fetch yang efisien
	idxTickers := []string{}
	usTickers := []string{}
	for _, p := range positions {
		if resolveMarket(p.PositionType) == "america" {
			usTickers = append(usTickers, p.Ticker)
		} else {
			idxTickers = append(idxTickers, p.Ticker)
		}
	}

	prices := make(map[string]float64)
	if len(idxTickers) > 0 {
		idxPrices, _ := s.provider.GetBatchPrices(idxTickers, "indonesia")
		for k, v := range idxPrices {
			prices["indonesia_"+k] = v
		}
	}
	if len(usTickers) > 0 {
		usPrices, _ := s.provider.GetBatchPrices(usTickers, "america")
		for k, v := range usPrices {
			prices["america_"+k] = v
		}
	}

	var totalEquityIDR float64
	var totalEquityUSD float64
	var portfolio []domain.PortfolioItem
	for _, p := range positions {
		market := resolveMarket(p.PositionType)
		// IDX: price per share Ã— qty (qty sudah dalam satuan lembar setelah Ã—100)
		// US:  price per share Ã— qty (qty = jumlah shares)
		currentPrice := prices[market+"_"+p.Ticker] * p.TotalQty

		currency := "IDR"
		if resolveMarket(p.PositionType) == "america" {
			currency = "USD"
			totalEquityUSD += currentPrice
		} else {
			totalEquityIDR += currentPrice
		}

		unrealizedPnL := (currentPrice - p.InvestedTotal)
		pnlPercentage := 0.0
		if p.InvestedTotal > 0 {
			pnlPercentage = (unrealizedPnL / p.InvestedTotal) * 100
		}

		portfolio = append(portfolio, domain.PortfolioItem{
			Ticker:             p.Ticker,
			TotalQty:           p.TotalQty,
			InvestedTotal:      p.InvestedTotal,
			CurrentMarketPrice: currentPrice,
			UnrealizedPnL:      unrealizedPnL,
			PnLPercentage:      pnlPercentage,
			UpdatedAt:          p.UpdatedAt,
			Provider:           p.Provider,
			AccountNo:          p.AccountNo,
			Currency:           currency,
		})
	}

	return &domain.PortfolioResponse{
		Items:          portfolio,
		TotalEquityIDR: totalEquityIDR,
		TotalEquityUSD: totalEquityUSD,
	}, nil
}

func (s *positionService) GetTickerCurrentPrice(ticker string, market string) (float64, error) {
	if market == "US" {
		return s.provider.GetCurrentPrice(ticker, "america")
	}
	return s.provider.GetCurrentPrice(ticker, "indonesia")
}

func (s *positionService) MigratePositions(userID uint64, provider string, accountNo string) error {
	db := s.repo.GetDB()
	return db.Transaction(func(tx *gorm.DB) error {
		positions, err := s.repo.GetPositions(userID)
		if err != nil {
			return err
		}

		for _, legacy := range positions {
			if legacy.Provider != "" {
				continue
			}
			existing, err := s.repo.GetPosByTicker(userID, legacy.Ticker, provider, accountNo, tx)
			if err == nil {
				existing.TotalQty += legacy.TotalQty
				existing.InvestedTotal += legacy.InvestedTotal
				if err := s.repo.UpdatePosition(existing, tx); err != nil {
					return err
				}
				if err := s.repo.RemovePosition(legacy.ID, tx); err != nil {
					return err
				}
			} else if errors.Is(err, gorm.ErrRecordNotFound) {
				legacy.Provider = provider
				legacy.AccountNo = accountNo
				if err := s.repo.UpdatePosition(&legacy, tx); err != nil {
					return err
				}
			} else {
				return err
			}
		}

		// Migrate legacy transactions (no provider and account_no, not "income" or "expense") to the new provider + account_no
		if err := s.transactionService.MigrateTradingTransactions(userID, provider, accountNo, tx); err != nil {
			return err
		}

		// Migrate Balance Records
		if err := s.balService.MigrateBalances(userID, provider, accountNo, tx); err != nil {
			return err
		}

		return nil
	})
}
