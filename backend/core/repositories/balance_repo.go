package repositories

import (
	"trade-tracker/core/domain"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BalanceRepository interface {
	CreateBalance(balance *domain.Balance, trx *gorm.DB) error
	RemoveBalance(balanceID uint64, trx *gorm.DB) error
	UpdateBalance(balance *domain.Balance, trx *gorm.DB) error

	GetBalanceByType(userID uint64, assetType string, provider string, trx *gorm.DB) (float64, error)
	GetBalance(balanceID uint64, trx *gorm.DB) (*domain.Balance, error)
	GetProviderAccount(userID uint64, assetType, provider, accountNo string, trx *gorm.DB) (*domain.Balance, error)
	GetBalances(userID uint64, trx *gorm.DB) ([]domain.Balance, error)
	GetProviderAccounts(userID uint64, assetType string) ([]domain.AccountResponse, error)
	SaveBalance(balance *domain.Balance, trx *gorm.DB) error
	GetDB() *gorm.DB
}

type balanceRepo struct {
	DB *gorm.DB
}

func NewBalanceRepo(DB *gorm.DB) BalanceRepository {
	return &balanceRepo{DB: DB}
}

func (r *balanceRepo) CreateBalance(balance *domain.Balance, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}
	return db.Create(balance).Error
}

func (r *balanceRepo) RemoveBalance(balanceID uint64, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}

	result := db.Unscoped().Delete(&domain.Balance{}, balanceID)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return domain.ErrItemNotFound
	}

	return nil
}

func (r *balanceRepo) UpdateBalance(balance *domain.Balance, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}

	var existing domain.Balance
	err := db.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("user_id = ? AND asset_type = ? AND provider = ? AND account_no = ?", balance.UserID, balance.AssetType, balance.Provider, balance.AccountNo).
		First(&existing).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			newBalance := &domain.Balance{
				UserID:    balance.UserID,
				AssetType: balance.AssetType,
				Provider:  balance.Provider,
				AccountNo: balance.AccountNo,
				Amount:    balance.Amount,
			}
			return db.Create(newBalance).Error
		}
		return err
	}

	existing.Amount += balance.Amount
	if balance.AccountNo != "" {
		existing.AccountNo = balance.AccountNo
	}
	return db.Save(&existing).Error
}

func (r *balanceRepo) GetBalances(userID uint64, trx *gorm.DB) ([]domain.Balance, error) {
	var balance []domain.Balance
	db := r.DB
	if trx != nil {
		db = trx
	}

	if err := db.Where("user_id = ?", userID).Find(&balance).Error; err != nil {
		return nil, err
	}

	return balance, nil
}

func (r *balanceRepo) GetBalance(balanceID uint64, trx *gorm.DB) (*domain.Balance, error) {
	var balances domain.Balance
	db := r.DB
	if trx != nil {
		db = trx
	}

	if err := db.Where("id = ?", balanceID).Take(&balances).Error; err != nil {
		return nil, err
	}

	return &balances, nil
}

func (r *balanceRepo) GetBalanceByType(userID uint64, assetType string, provider string, trx *gorm.DB) (float64, error) {
	var balance domain.Balance
	db := r.DB
	if trx != nil {
		db = trx
	}

	if err := db.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("user_id = ? AND asset_type = ? AND provider = ?", userID, assetType, provider).
		Take(&balance).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return 0, nil
		}
		return 0, err
	}

	return balance.Amount, nil
}

func (r *balanceRepo) GetProviderAccounts(userID uint64, assetType string) ([]domain.AccountResponse, error) {
	var accounts []domain.AccountResponse
	err := r.DB.Model(&domain.Balance{}).
		Select("provider as provider_name", "account_no", "currency", "amount").
		Where("user_id = ? AND asset_type = ? AND provider != '' AND account_no != ''", userID, assetType).
		Find(&accounts).Error

	if err != nil {
		return nil, err
	}

	return accounts, nil
}

func (r *balanceRepo) GetProviderAccount(userID uint64, assetType, provider, accountNo string, trx *gorm.DB) (*domain.Balance, error) {
	var balance domain.Balance
	db := r.DB
	if trx != nil {
		db = trx
	}

	if err := db.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("user_id = ? AND asset_type = ? AND provider = ? AND account_no = ?", userID, assetType, provider, accountNo).
		Take(&balance).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return &balance, nil
}

func (r *balanceRepo) GetDB() *gorm.DB {
	return r.DB
}

func (r *balanceRepo) SaveBalance(balance *domain.Balance, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}
	return db.Save(balance).Error
}
