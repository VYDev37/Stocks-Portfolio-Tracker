package repositories

import (
	"stocks-portfolio-tracker/core/domain"

	"gorm.io/gorm"
)

type TransactionRepository interface {
	AddTransaction(log *domain.Transaction, tx *gorm.DB) error
	GetTransactions(userID uint64) ([]domain.Transaction, error)
	GetTransactionByID(id uint, tx *gorm.DB) (*domain.Transaction, error)
	UpdateTransaction(transaction *domain.Transaction, tx *gorm.DB) error
	MigrateTradingTransactions(userID uint64, provider string, accountNo string, tx *gorm.DB) error
	MigrateNonTradingTransactions(userID uint64, provider string, accountNo string, transactionIDs []uint, tx *gorm.DB) error
	GetTransactionsByIDsAndTypes(userID uint64, ids []uint, types []string, tx *gorm.DB) ([]domain.Transaction, error)
	GetDB() *gorm.DB
}

type transactionRepo struct {
	DB *gorm.DB
}

func NewTransactionRepo(DB *gorm.DB) TransactionRepository {
	return &transactionRepo{DB: DB}
}

func (r *transactionRepo) AddTransaction(log *domain.Transaction, tx *gorm.DB) error {
	db := r.DB
	if tx != nil {
		db = tx
	}
	return db.Create(&log).Error
}

func (r *transactionRepo) GetTransactions(userID uint64) ([]domain.Transaction, error) {
	var transactions []domain.Transaction
	if err := r.DB.Where("owner_id = ?", userID).Find(&transactions).Error; err != nil {
		return nil, err
	}

	return transactions, nil
}

func (r *transactionRepo) GetTransactionByID(id uint, tx *gorm.DB) (*domain.Transaction, error) {
	db := r.DB
	if tx != nil {
		db = tx
	}
	var transaction domain.Transaction
	if err := db.First(&transaction, id).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *transactionRepo) UpdateTransaction(transaction *domain.Transaction, tx *gorm.DB) error {
	db := r.DB
	if tx != nil {
		db = tx
	}
	return db.Save(transaction).Error
}

func (r *transactionRepo) GetDB() *gorm.DB {
	return r.DB
}

func (r *transactionRepo) MigrateTradingTransactions(userID uint64, provider string, accountNo string, tx *gorm.DB) error {
	db := r.DB
	if tx != nil {
		db = tx
	}
	return db.Model(&domain.Transaction{}).
		Where("owner_id = ? AND (provider = '' OR provider IS NULL) AND (account_no = '' OR account_no IS NULL) AND transaction_type != ? AND transaction_type != ?",
			userID, "income", "expense").
		Updates(map[string]interface{}{
			"provider":   provider,
			"account_no": accountNo,
		}).Error
}

func (r *transactionRepo) MigrateNonTradingTransactions(userID uint64, provider string, accountNo string, transactionIDs []uint, tx *gorm.DB) error {
	db := r.DB
	if tx != nil {
		db = tx
	}
	return db.Model(&domain.Transaction{}).
		Where("owner_id = ? AND id IN ? AND (transaction_type = ? OR transaction_type = ?)",
			userID, transactionIDs, "income", "expense").
		Updates(map[string]interface{}{
			"provider":   provider,
			"account_no": accountNo,
		}).Error
}

func (r *transactionRepo) GetTransactionsByIDsAndTypes(userID uint64, ids []uint, types []string, tx *gorm.DB) ([]domain.Transaction, error) {
	db := r.DB
	if tx != nil {
		db = tx
	}
	var transactions []domain.Transaction
	if err := db.Where("owner_id = ? AND id IN ? AND transaction_type IN ?", userID, ids, types).Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}
