package handlers

import (
	"strconv"
	"stocks-portfolio-tracker/core/domain"
	"stocks-portfolio-tracker/core/services"
	"stocks-portfolio-tracker/pkg/utils/format"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
)

type TransactionHandler struct {
	service  services.TransactionService
	validate *validator.Validate
}

func NewTransactionHandler(service services.TransactionService) *TransactionHandler {
	return &TransactionHandler{
		service:  service,
		validate: validator.New(),
	}
}

func (h *TransactionHandler) HandleGetLocalTransaction(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	data, err := h.service.GetLocalTransactions(uid)
	if err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"transactions": data})
}

func (h *TransactionHandler) HandleUpdateTransaction(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	txIdBase, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid transaction ID."})
	}

	var req domain.TransactionUpdateReq
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

	if err := h.service.UpdateTransaction(uint(txIdBase), uid, req); err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"message": "Transaction updated successfully."})
}

func (h *TransactionHandler) HandleMigrateTransactions(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	var req struct {
		Provider       string `json:"provider" validate:"required"`
		AccountNo      string `json:"account_no" validate:"required"`
		TransactionIDs []uint `json:"transaction_ids" validate:"required,gt=0"`
	}

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Failed to parse body."})
	}

	if req.Provider == "" || req.AccountNo == "" || len(req.TransactionIDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"message": "Provider, account_no, and transaction_ids are required."})
	}

	if err := h.service.MigrateTransactions(uid, req.Provider, req.AccountNo, req.TransactionIDs); err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"message": "Transactions migrated successfully."})
}

