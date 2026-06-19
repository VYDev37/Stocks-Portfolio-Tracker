package providers

import (
	"trade-tracker/core/worker"

	"github.com/VYDev37/go-tvscanner-api/pkg/scanner"
)

// AssetProvider mendefinisikan kontrak untuk mengambil daftar aset.
type AssetProvider interface {
	// GetAssets mengembalikan semua aset IDX dari in-memory store.
	GetAssets() []scanner.M
	// GetUSAssets mengembalikan semua aset US (NYSE/NASDAQ) dari in-memory store.
	GetUSAssets() []scanner.M
}

type assetProvider struct{}

func NewAssetProvider() AssetProvider {
	return &assetProvider{}
}

func (s *assetProvider) GetAssets() []scanner.M {
	data := scanner.GlobalStore.GetData()
	return buildAssetList(data)
}

func (s *assetProvider) GetUSAssets() []scanner.M {
	data := worker.USStore.GetData()
	return buildAssetList(data)
}

// buildAssetList mengkonversi slice TVAsset menjadi slice scanner.M
// yang siap dikonsumsi oleh frontend.
func buildAssetList(data []scanner.TVAsset) []scanner.M {
	assetList := make([]scanner.M, 0, len(data))
	for _, asset := range data {
		assetList = append(assetList, scanner.M{
			"ticker": asset.Ticker,
			"name":   asset.Description,
			"price":  asset.Price,
			"change": asset.Change,
		})
	}
	return assetList
}
