package handlers

import (
	"strconv"
	"stocks-portfolio-tracker/core/domain"
	"stocks-portfolio-tracker/core/services"
	"stocks-portfolio-tracker/pkg/utils/format"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
	"github.com/microcosm-cc/bluemonday"
)

type NoteHandler struct {
	service  services.NoteService
	validate *validator.Validate
}

func NewNoteHandler(service services.NoteService) *NoteHandler {
	return &NoteHandler{
		service:  service,
		validate: validator.New(),
	}
}

func (h *NoteHandler) HandleAddNote(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	var req domain.NoteRequest

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

	p := bluemonday.StrictPolicy()
	req.Description = p.Sanitize(req.Description)
	req.Title = p.Sanitize(req.Title)
	req.Category = p.Sanitize(req.Category)

	if err := h.service.AddNote(&domain.Note{
		UserID:      uid,
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		ImageURL:    req.ImageURL,
	}); err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"message": "Note added."})
}

func (h *NoteHandler) HandleUpdateNote(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	noteId, err := strconv.Atoi(c.Params("nId"))
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"message": err.Error()})
	}

	var req domain.NoteRequest

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

	p := bluemonday.StrictPolicy()
	req.Description = p.Sanitize(req.Description)
	req.Title = p.Sanitize(req.Title)
	req.Category = p.Sanitize(req.Category)

	note := &domain.Note{
		UserID:      uid,
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		ImageURL:    req.ImageURL,
	}
	note.ID = uint(noteId)

	if err := h.service.UpdateNote(note); err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"message": "Note added."})
}

func (h *NoteHandler) HandleGetNotes(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	data, err := h.service.GetNotes(uid)
	if err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"notes": data})
}

func (h *NoteHandler) HandleRemoveNote(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}

	noteId, err := strconv.Atoi(c.Params("nId"))
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"message": err.Error()})
	}

	if err := h.service.RemoveNote(uint(noteId), uid); err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(200).JSON(fiber.Map{"message": "success"})
}
