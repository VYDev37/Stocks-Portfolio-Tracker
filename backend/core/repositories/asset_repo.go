package repositories

import (
	"context"
	"stocks-portfolio-tracker/core/domain"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AssetRepository interface {
	UpsertAsset(ctx context.Context, asset *domain.Asset) error
	GetScreenerResults(ctx context.Context) ([]domain.Asset, error)
}

type assetRepo struct {
	db *gorm.DB
}

func NewAssetRepo(db *gorm.DB) AssetRepository {
	return &assetRepo{db: db}
}

func (r *assetRepo) UpsertAsset(ctx context.Context, asset *domain.Asset) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "ticker"}},
		UpdateAll: true,
	}).Create(asset).Error
}

func (r *assetRepo) GetScreenerResults(ctx context.Context) ([]domain.Asset, error) {
	var assets []domain.Asset
	// Basic implementation, will be enhanced with dynamic filters
	if err := r.db.WithContext(ctx).Find(&assets).Error; err != nil {
		return nil, err
	}
	return assets, nil
}
