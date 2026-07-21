package services

import (
	"context"
	"log"
	"strings"

	"stocks-portfolio-tracker/core/domain"
	"stocks-portfolio-tracker/core/integrations/providers"
	"stocks-portfolio-tracker/core/repositories"
	"stocks-portfolio-tracker/core/worker"

	"github.com/VYDev37/go-tvscanner-api/pkg/scanner"
)

type AssetService interface {
	FetchAndSync(ctx context.Context) error

	// GetTickerChart mengambil data chart untuk ticker tertentu.
	// Parameter market: "indonesia" untuk IDX, "america" untuk US.
	GetTickerChart(ticker string, market string, timeframe string) (*domain.AssetChartResponse, error)

	// IDX Assets
	GetAssets() []scanner.M
	GetAsset(ticker string) (scanner.TVAsset, bool)

	// US Assets
	GetUSAssets() []scanner.M
	GetUSAsset(ticker string) (scanner.TVAsset, bool)
}

type assetService struct {
	assetRepo repositories.AssetRepository
	aProvider providers.AssetProvider
	pProvider providers.PriceProvider
}

func NewAssetService(repo repositories.AssetRepository, aProvider providers.AssetProvider, pProvider providers.PriceProvider) AssetService {
	return &assetService{assetRepo: repo, aProvider: aProvider, pProvider: pProvider}
}

func (s *assetService) FetchAndSync(ctx context.Context) error {
	log.Println("Starting FetchAndSync...")
	// SOON: change with go-tradingview lib
	log.Println("FetchAndSync completed.")
	return nil
}

func (s *assetService) GetTickerChart(ticker string, market string, timeframe string) (*domain.AssetChartResponse, error) {
	return s.pProvider.GetChart(strings.ToUpper(ticker), market, timeframe)
}

// --- IDX ---

func (s *assetService) GetAssets() []scanner.M {
	return s.aProvider.GetAssets()
}

func (s *assetService) GetAsset(ticker string) (scanner.TVAsset, bool) {
	store := scanner.GlobalStore
	store.RLock()
	defer store.RUnlock()

	asset, found := store.Index[ticker]
	return asset, found
}

// --- US ---

func (s *assetService) GetUSAssets() []scanner.M {
	return s.aProvider.GetUSAssets()
}

func (s *assetService) GetUSAsset(ticker string) (scanner.TVAsset, bool) {
	store := worker.USStore
	store.RLock()
	defer store.RUnlock()

	asset, found := store.Index[ticker]
	return asset, found
}
