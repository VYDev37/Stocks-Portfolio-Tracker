package services

import (
	"strings"
	"stocks-portfolio-tracker/core/domain"
	"stocks-portfolio-tracker/core/repositories"
	"stocks-portfolio-tracker/pkg/utils/hash"

	"gorm.io/gorm"
)

type UserService interface {
	CreateUser(user *domain.User) error

	Login(identifier, password string) (*domain.User, error)
	GetUserByUsernameOrEmail(username, email string) (*domain.User, error)
	GetProfile(userID uint64) (*domain.UserProfileResponse, error)
}

type userService struct {
	repo        repositories.UserRepository
	posService  PositionService
	tranService TransactionService
	balService  BalanceService
}

func NewUserService(repo repositories.UserRepository, posService PositionService, tranService TransactionService, balService BalanceService) UserService {
	return &userService{repo: repo, posService: posService, tranService: tranService, balService: balService}
}

func (s *userService) CreateUser(user *domain.User) error {
	user.Username = strings.ToLower(user.Username)
	user.Email = strings.ToLower(user.Email)

	hashed, err := hash.HashPassword(user.Password)
	if err != nil {
		return domain.ErrInvalidInput
	}
	user.Password = hashed

	db := s.repo.GetDB()
	return db.Transaction(func(tx *gorm.DB) error {
		if _, err := s.repo.GetUserByUsernameOrEmail(user.Username, user.Email, tx); err == nil {
			return domain.ErrAlreadyExist
		}

		if err := s.repo.CreateUser(user, tx); err != nil {
			if err == gorm.ErrDuplicatedKey || strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "23505") {
				return domain.ErrAlreadyExist
			}
			return err
		}

		defaultBalances := []domain.Balance{
			{UserID: uint64(user.ID), AssetType: "stock_balance", Amount: 0},
			{UserID: uint64(user.ID), AssetType: "cash_balance", Amount: 0},
		}

		for _, b := range defaultBalances {
			if err := s.balService.CreateBalance(&b, tx); err != nil {
				return err
			}
		}

		return nil
	})
}

func (s *userService) Login(identifier, password string) (*domain.User, error) {
	identifier = strings.ToLower(identifier)

	user, err := s.repo.GetUserByUsernameOrEmail(identifier, identifier, nil)
	if err != nil {
		return nil, domain.ErrWrongCredential
	}

	if isCorrect, err := hash.VerifyPassword(password, user.Password); err != nil || !isCorrect {
		return nil, domain.ErrWrongCredential
	}

	resp := &domain.User{}
	resp.ID = user.ID

	return resp, nil
}

func (s *userService) GetUserByUsernameOrEmail(username, email string) (*domain.User, error) {
	return s.repo.GetUserByUsernameOrEmail(strings.ToLower(username), strings.ToLower(email), nil)
}

func (s *userService) GetProfile(userID uint64) (*domain.UserProfileResponse, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	balance, err := s.balService.GetBalances(userID, nil)
	if err != nil || balance == nil {
		return nil, err
	}

	portfolio, err := s.posService.GetPortfolio(userID)
	if err != nil {
		return nil, err
	}

	totalEquity := balance.StockBalance + portfolio.TotalEquityIDR

	return &domain.UserProfileResponse{
		Name:     user.Name,
		Username: user.Username,
		Balance: domain.BalanceDetail{
			CashBalance:  balance.CashBalance,
			StockBalance: balance.StockBalance,
		},
		TotalEquity: totalEquity,
		Portfolio:   portfolio,
	}, nil
}
