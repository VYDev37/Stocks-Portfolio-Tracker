package handlers

import (
	"strings"
	"stocks-portfolio-tracker/core/domain"
	"stocks-portfolio-tracker/core/services"
	"stocks-portfolio-tracker/pkg/utils/format"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
)

type PositionHandler struct {
	service  services.PositionService
	validate *validator.Validate
}

func NewPositionHandler(service services.PositionService) *PositionHandler {
	return &PositionHandler{
		service:  service,
		validate: validator.New(),
	}
}

func (h *PositionHandler) HandleGetTickerMarketPrice(c fiber.Ctx) error {
	ticker := strings.ToUpper(c.Params("ticker"))
	if ticker == "" {
		return c.Status(401).JSON(fiber.Map{"message": "Ticker is required."})
	}

	market := strings.ToUpper(c.Query("market", "IDX"))
	price, err := h.service.GetTickerCurrentPrice(ticker, market)
	if err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"message": "Success", "price": price})
}

func (h *PositionHandler) HandleAddPosition(c fiber.Ctx) error {
	var req domain.PositionAddReq
	directionType := c.Params("type")

	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Failed to parse body."})
	}

	if err := h.validate.Struct(req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errFirst := validationErrors[0]
			return c.Status(400).JSON(fiber.Map{"message": format.FormatError(errFirst)})
		}
		return c.Status(400).JSON(fiber.Map{"message": "Invalid request."})
	}

	if err := h.service.AddPosition(directionType, &domain.Position{
		OwnerID:       uid,
		TotalQty:      req.TotalQty,
		Ticker:        req.Ticker,
		InvestedTotal: req.InvestedTotal,
		PositionType:  req.PositionType,
		Provider:      req.Provider,
		AccountNo:     req.AccountNo,
	}, req.Fee); err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"message": "Position added."})
}

func (h *PositionHandler) HandleGetPortfolio(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	data, err := h.service.GetPositions(uid)
	if err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"portfolio": data})
}

func (h *PositionHandler) HandleMigratePositions(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	var req struct {
		Provider  string `json:"provider" validate:"required"`
		AccountNo string `json:"account_no" validate:"required"`
	}

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Failed to parse body."})
	}

	if req.Provider == "" || req.AccountNo == "" {
		return c.Status(400).JSON(fiber.Map{"message": "Provider and account_no are required."})
	}

	if err := h.service.MigratePositions(uid, req.Provider, req.AccountNo); err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"message": "Positions migrated successfully."})
}

