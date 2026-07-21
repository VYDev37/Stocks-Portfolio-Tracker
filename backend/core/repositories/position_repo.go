package repositories

import (
	"stocks-portfolio-tracker/core/domain"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PositionRepository interface {
	AddPosition(pos *domain.Position, trx *gorm.DB) error
	RemovePosition(posID uint, trx *gorm.DB) error
	UpdatePosition(pos *domain.Position, trx *gorm.DB) error

	GetPositions(userID uint64) ([]domain.Position, error)
	GetPosByTicker(userID uint64, ticker string, provider string, accountNo string, tx *gorm.DB) (*domain.Position, error)
	GetDB() *gorm.DB
}

type positionRepo struct {
	DB *gorm.DB
}

func NewPositionRepo(DB *gorm.DB) PositionRepository {
	return &positionRepo{DB: DB}
}

func (r *positionRepo) AddPosition(pos *domain.Position, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}
	return db.Create(&pos).Error
}

func (r *positionRepo) GetPosByTicker(userID uint64, ticker string, provider string, accountNo string, tx *gorm.DB) (*domain.Position, error) {
	var pos domain.Position
	db := r.DB
	if tx != nil {
		db = tx
	}

	err := db.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("owner_id = ? AND ticker = ? AND provider = ? AND account_no = ?", userID, ticker, provider, accountNo).
		Take(&pos).Error

	if err != nil {
		return nil, err
	}
	return &pos, nil
}

func (r *positionRepo) GetPositions(userID uint64) ([]domain.Position, error) {
	var positions []domain.Position
	if err := r.DB.Where("owner_id = ?", userID).Find(&positions).Error; err != nil {
		return nil, err
	}

	return positions, nil
}

func (r *positionRepo) RemovePosition(posID uint, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}
	result := db.Unscoped().Delete(&domain.Position{}, posID)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return domain.ErrItemNotFound
	}

	return nil
}
func (r *positionRepo) UpdatePosition(pos *domain.Position, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}
	return db.Save(pos).Error
}

func (r *positionRepo) GetDB() *gorm.DB {
	return r.DB
}
