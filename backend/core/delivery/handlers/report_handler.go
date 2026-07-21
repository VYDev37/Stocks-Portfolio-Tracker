package handlers

import (
	"bytes"
	"fmt"
	"stocks-portfolio-tracker/core/services"

	"github.com/gofiber/fiber/v3"
)

type ReportHandler struct {
	service services.ReportService
}

func NewReportHandler(service services.ReportService) *ReportHandler {
	return &ReportHandler{service: service}
}

func (h *ReportHandler) ExportProfile(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	file, err := h.service.ExportProfile(userID)
	if err != nil {
		fmt.Printf("Error on ExportProfile: %s.\n", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate excel file."})
	}

	c.Set("Content-Type", "application/octet-stream")
	c.Set("Content-Disposition", "attachment; filename=TPT_Export.xlsx")

	var buf bytes.Buffer
	if err := file.Write(&buf); err != nil {
		return err
	}

	return c.Send(buf.Bytes())
}
