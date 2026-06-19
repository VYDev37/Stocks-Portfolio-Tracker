package providers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
	"trade-tracker/core/domain"
)

type YahooChartResponse struct {
	Chart struct {
		Result []struct {
			Timestamp  []int64 `json:"timestamp"`
			Indicators struct {
				Quote []struct {
					Open   []*float64 `json:"open"`
					High   []*float64 `json:"high"`
					Low    []*float64 `json:"low"`
					Close  []*float64 `json:"close"`
					Volume []*float64 `json:"volume"`
				} `json:"quote"`
			} `json:"indicators"`
		} `json:"result"`
	} `json:"chart"`
}

type YahooFundamentalResponse struct {
	Chart struct {
		Result []struct {
			Meta struct {
				RegularMarketPrice float64 `json:"regularMarketPrice"`
			} `json:"meta"`
		} `json:"result"`
	} `json:"chart"`
}

// PriceProvider mendefinisikan kontrak untuk mengambil data harga aset.
type PriceProvider interface {
	GetChart(ticker string, market string, timeframe string) (*domain.AssetChartResponse, error)
	GetCurrentPrice(ticker string, market string) (float64, error)
	GetBatchPrices(tickers []string, market string) (map[string]float64, error)
}

type priceProvider struct {
	Client *http.Client
}

func NewPriceProvider() PriceProvider {
	return &priceProvider{Client: &http.Client{Timeout: 10 * time.Second}}
}

func buildYahooSymbol(ticker string, market string) string {
	ticker = strings.ReplaceAll(ticker, ".", "-")
	switch strings.ToLower(market) {
	case "indonesia", "idx":
		return ticker + ".JK"
	default:
		return ticker
	}
}

func (s *priceProvider) fetchYahooChart(yahooSymbol string, queryParams string) (*YahooChartResponse, error) {
	url := fmt.Sprintf("https://query1.finance.yahoo.com/v8/finance/chart/%s%s", yahooSymbol, queryParams)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Connection", "keep-alive")

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("yahoo v8 API error: status %d", resp.StatusCode)
	}

	var data YahooChartResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return &data, nil
}

func parseYahooCandles(data *YahooChartResponse) []domain.Candle {
	if data == nil || len(data.Chart.Result) == 0 {
		return nil
	}

	result := data.Chart.Result[0]
	if len(result.Indicators.Quote) == 0 {
		return nil
	}
	quotes := result.Indicators.Quote[0]

	var candles []domain.Candle
	for i, tz := range result.Timestamp {
		if i >= len(quotes.Open) || i >= len(quotes.Close) || i >= len(quotes.High) || i >= len(quotes.Low) || i >= len(quotes.Volume) {
			continue
		}
		if quotes.Open[i] == nil || quotes.Close[i] == nil || quotes.High[i] == nil || quotes.Low[i] == nil || quotes.Volume[i] == nil {
			continue
		}

		candles = append(candles, domain.Candle{
			Time:   tz,
			Open:   *quotes.Open[i],
			Close:  *quotes.Close[i],
			High:   *quotes.High[i],
			Low:    *quotes.Low[i],
			Volume: *quotes.Volume[i],
		})
	}

	return candles
}

func (s *priceProvider) GetChart(ticker string, market string, timeframe string) (*domain.AssetChartResponse, error) {
	yahooSymbol := buildYahooSymbol(ticker, market)

	timeframe = strings.ToLower(timeframe)
	if strings.HasSuffix(timeframe, "m") && !strings.HasSuffix(timeframe, "mo") {
		timeframe = strings.Replace(timeframe, "m", "mo", 1)
	}

	var interval string
	switch timeframe {
	case "1d":
		interval = "5m"
	case "5d":
		interval = "15m"
	case "1mo":
		interval = "1h"
	default:
		interval = "1d"
	}

	primaryRange := fmt.Sprintf("?range=%s&interval=%s", timeframe, interval)

	ranges := []string{
		primaryRange,
		"?range=1d&interval=15m",
		"?range=5d&interval=15m",
		"?range=1mo&interval=1h",
	}

	var candles []domain.Candle
	var err error

	for _, rangeQuery := range ranges {
		var data *YahooChartResponse
		data, err = s.fetchYahooChart(yahooSymbol, rangeQuery)
		if err != nil {
			continue
		}
		candles = parseYahooCandles(data)
		if len(candles) > 0 {
			break
		}
	}

	if len(candles) == 0 {
		if err != nil {
			return nil, fmt.Errorf("no data available: %v", err)
		}
		return nil, fmt.Errorf("no data available after trying fallback ranges")
	}

	last := candles[len(candles)-1]
	lastVol := last.Volume

	var dOpen, dHigh, dLow float64
	for i, c := range candles {
		if i == 0 {
			dOpen = c.Open
			dHigh = c.High
			dLow = c.Low
			continue
		}
		if c.High > dHigh {
			dHigh = c.High
		}
		if c.Low < dLow {
			dLow = c.Low
		}
	}

	return &domain.AssetChartResponse{
		Ticker:    ticker,
		LastPrice: last.Close,
		DailyHigh: dHigh,
		DailyLow:  dLow,
		DailyOpen: dOpen,
		LastVol:   lastVol,
		Chart:     candles,
	}, nil
}

func (s *priceProvider) GetCurrentPrice(ticker string, market string) (float64, error) {
	yahooSymbol := buildYahooSymbol(ticker, market)
	url := fmt.Sprintf("https://query1.finance.yahoo.com/v8/finance/chart/%s?range=1d&interval=1d", yahooSymbol)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

	resp, err := s.Client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("yahoo v8 API error: status %d", resp.StatusCode)
	}

	var data YahooFundamentalResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return 0, err
	}

	if len(data.Chart.Result) == 0 {
		return 0, fmt.Errorf("ticker %s tidak ditemukan", ticker)
	}
	return data.Chart.Result[0].Meta.RegularMarketPrice, nil
}

func (s *priceProvider) GetBatchPrices(tickers []string, market string) (map[string]float64, error) {
	result := make(map[string]float64)
	resChan := make(chan struct {
		ticker string
		price  float64
	}, len(tickers))

	var wg sync.WaitGroup

	for _, t := range tickers {
		wg.Add(1)
		go func(ticker string) {
			defer wg.Done()
			price, err := s.GetCurrentPrice(ticker, market)
			if err == nil {
				resChan <- struct {
					ticker string
					price  float64
				}{ticker, price}
			}
		}(t)
	}

	go func() {
		wg.Wait()
		close(resChan)
	}()

	for r := range resChan {
		result[r.ticker] = r.price
	}

	return result, nil
}
