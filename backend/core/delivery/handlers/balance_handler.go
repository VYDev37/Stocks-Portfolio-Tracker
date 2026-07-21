package handlers

import (
	"stocks-portfolio-tracker/core/domain"
	"stocks-portfolio-tracker/core/services"
	"stocks-portfolio-tracker/pkg/utils/format"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
)

type BalanceHandler struct {
	service  services.BalanceService
	validate *validator.Validate
}

func NewBalanceHandler(service services.BalanceService) *BalanceHandler {
	return &BalanceHandler{
		service:  service,
		validate: validator.New(),
	}
}

func (h *BalanceHandler) HandleUpdateBalance(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	var req domain.BalanceUpdateReq
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

	if err := h.service.AdjustBalance(uid, req); err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"message": "Balance updated."})
}

func (h *BalanceHandler) HandleGetAccountsByType(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	assetType := c.Params("type")
	if assetType != "stock_balance" && assetType != "cash_balance" {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid asset type."})
	}

	accounts, err := h.service.GetAccountsByType(uid, assetType)
	if err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"accounts": accounts})
}
