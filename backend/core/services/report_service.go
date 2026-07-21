package services

import (
	"fmt"
	"math"
	"strings"

	"stocks-portfolio-tracker/core/integrations/providers"
	"stocks-portfolio-tracker/pkg/utils/excel"
	"stocks-portfolio-tracker/pkg/utils/format"

	"github.com/xuri/excelize/v2"
)

type ReportService interface {
	ExportProfile(userID uint64) (*excelize.File, error)
}

type reportService struct {
	pService PositionService
	uService UserService
	tService TransactionService

	provider providers.PriceProvider
}

func NewReportService(pService PositionService, uService UserService,
	tService TransactionService, provider providers.PriceProvider) ReportService {
	return &reportService{pService: pService, uService: uService, tService: tService, provider: provider}
}

func (s *reportService) exportFinancialLog(f *excelize.File, userID uint64) error {
	sectionName := "Financial"
	f.NewSheet(sectionName)

	writer := excel.NewWriter(f, sectionName, 1)
	writer.WriteHeader([]interface{}{"My Financial Log"})

	startRow := writer.CurrentRow

	writer.SetFormat(2, excel.FormatDate)     // 2nd col: date
	writer.SetFormat(4, excel.FormatCurrency) // 4th col: amt
	writer.SetFormat(5, excel.FormatCurrency) // 5th col: fee

	header := []interface{}{"ID", "Date", "Source", "Amount", "Fee", "Flow type", "Note"}
	writer.WriteHeader(header)

	txs, err := s.tService.GetLocalTransactions(userID)
	if err != nil {
		return err
	}

	for _, t := range txs {
		if t.TransactionType != "income" && t.TransactionType != "expense" {
			continue
		}
		writer.WriteRow([]interface{}{
			fmt.Sprintf("#%d", t.ID),
			t.CreatedAt,
			t.Ticker,
			t.Price,
			t.TransactionFee,
			strings.ToUpper(t.TransactionType),
			t.Notes,
		})
	}

	writer.BuildTable(sectionName, startRow, len(header))
	return nil
}

func (s *reportService) exportTransactions(f *excelize.File, userID uint64) error {
	sectionName := "Transactions"
	f.NewSheet(sectionName)

	writer := excel.NewWriter(f, sectionName, 1)
	writer.WriteHeader([]interface{}{"My Transactions"})

	startRow := writer.CurrentRow

	header := []interface{}{"ID", "Date", "Ticker", "Amount", "Fee", "Action"}
	writer.WriteHeader(header)

	txs, err := s.tService.GetLocalTransactions(userID)
	if err != nil {
		return err
	}
	for _, t := range txs {
		if t.TransactionType != "buy" && t.TransactionType != "sell" {
			continue
		}
		writer.WriteRow([]interface{}{
			fmt.Sprintf("#%d", t.ID),
			t.CreatedAt,
			t.Ticker,
			format.FormatCurrency(t.Price),
			format.FormatCurrency(t.TransactionFee),
			strings.ToUpper(t.TransactionType),
		})
	}

	writer.BuildTable(sectionName, startRow, len(header))
	return nil
}

func (s *reportService) exportPositions(f *excelize.File, userID uint64) error {
	sectionName := "Portfolio"
	f.NewSheet(sectionName)

	writer := excel.NewWriter(f, sectionName, 1)
	writer.WriteHeader([]interface{}{"My Open Positions"})

	startRow := writer.CurrentRow
	header := []interface{}{
		"No", "Ticker", "AvgPrice", "Invested Amount",
		"Quantity", "Market Value", "PnL Unrealized", "PnL Unrealized (Percentage)",
	}

	writer.WriteHeader(header)

	pos, err := s.pService.GetPositions(userID)
	if err != nil {
		return err
	}
	tickers := []string{}

	for _, p := range pos {
		tickers = append(tickers, p.Ticker)
	}

	var currentValue float64

	portfolio, err := s.pService.GetPortfolio(userID)
	if err != nil {
		return err
	}
	if portfolio == nil {
		return fmt.Errorf("portfolio is empty")
	}

	// Kelompokkan ticker berdasarkan market (konsisten dengan position_service)
	idxTickers := []string{}
	usTickers := []string{}
	for _, p := range pos {
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

	for i, p := range pos {
		market := resolveMarket(p.PositionType)
		currency := "IDR"
		if market == "america" {
			currency = "USD"
		}

		currentPrice := prices[market+"_"+p.Ticker] * p.TotalQty
		if currentPrice <= 0 || p.InvestedTotal <= 0 {
			continue
		}
		if currency == "USD" {
			currentValue += currentPrice
		} else {
			currentValue += currentPrice
		}

		delta := currentPrice - p.InvestedTotal
		pnlPercent := math.Abs((delta / p.InvestedTotal) * 100)

		percentStr := format.FormatNumber(pnlPercent)
		if delta < 0 {
			percentStr = "(" + percentStr + ")"
		}

		fmtInvested := format.FormatCurrency(p.InvestedTotal)
		fmtMarket := format.FormatCurrency(currentPrice)
		fmtDelta := format.FormatCurrency(delta)

		if currency == "USD" {
			fmtInvested = fmt.Sprintf("$%s", format.FormatNumber(p.InvestedTotal))
			fmtMarket = fmt.Sprintf("$%s", format.FormatNumber(currentPrice))
			fmtDelta = fmt.Sprintf("$%s", format.FormatNumber(delta))
		}

		writer.WriteRow([]interface{}{
			i + 1,
			p.Ticker,
			format.FormatNumber(p.InvestedTotal / p.TotalQty),
			fmtInvested,
			format.FormatNumber(p.TotalQty),
			fmtMarket,
			fmtDelta,
			percentStr,
		})
	}

	writer.BuildTable(sectionName, startRow, len(header))
	writer.SkipRow()

	header2 := []interface{}{"NAME", "AMOUNT (IDR)", "AMOUNT (USD)"}
	startRow2 := writer.CurrentRow

	writer.WriteHeader(header2)
	writer.WriteRow([]interface{}{"Total invested / market value", format.FormatCurrency(portfolio.TotalEquityIDR), fmt.Sprintf("$%s", format.FormatNumber(portfolio.TotalEquityUSD))})
	writer.BuildTable(sectionName+"_2", startRow2, len(header2))
	return nil
}

func (s *reportService) ExportProfile(userID uint64) (*excelize.File, error) {
	f := excelize.NewFile()

	if err := s.exportTransactions(f, userID); err != nil {
		return nil, err
	}
	if err := s.exportPositions(f, userID); err != nil {
		return nil, err
	}
	if err := s.exportFinancialLog(f, userID); err != nil {
		return nil, err
	}

	index, _ := f.GetSheetIndex("Transactions")

	f.SetActiveSheet(index)
	f.DeleteSheet("Sheet1")

	return f, nil
}
