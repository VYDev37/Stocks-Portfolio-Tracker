package repositories

import (
	"stocks-portfolio-tracker/core/domain"

	"gorm.io/gorm"
)

type UserRepository interface {
	CreateUser(user *domain.User, trx *gorm.DB) error
	GetUserByUsernameOrEmail(username, email string, tx *gorm.DB) (*domain.User, error)
	GetUserByID(userID uint64) (*domain.User, error)

	GetDB() *gorm.DB
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) CreateUser(user *domain.User, trx *gorm.DB) error {
	db := r.db
	if trx != nil {
		db = trx
	}

	return db.Create(user).Error
}

func (r *userRepo) GetUserByUsernameOrEmail(username, email string, tx *gorm.DB) (*domain.User, error) {
	var user domain.User
	db := r.db
	if tx != nil {
		db = tx
	}
	if err := db.Where("username = ? OR email = ?", username, email).Take(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) GetUserByID(userID uint64) (*domain.User, error) {
	var user domain.User
	if err := r.db.Take(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) GetDB() *gorm.DB {
	return r.db
}
