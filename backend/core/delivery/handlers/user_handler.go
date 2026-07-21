package handlers

import (
	"log"
	"os"
	"time"

	"stocks-portfolio-tracker/core/domain"
	"stocks-portfolio-tracker/core/services"
	"stocks-portfolio-tracker/pkg/utils/auth"
	"stocks-portfolio-tracker/pkg/utils/format"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
)

type UserHandler struct {
	service  services.UserService
	validate *validator.Validate
}

func NewUserHandler(service services.UserService) *UserHandler {
	return &UserHandler{
		service:  service,
		validate: validator.New(),
	}
}

func (h *UserHandler) HandleRegister(c fiber.Ctx) error {
	var req domain.UserRegisterReq

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"code": fiber.StatusBadRequest, "message": "Failed to parse body."})
	}

	user := &domain.User{
		Username: req.Username,
		Name:     req.Name,
		Password: req.Password,
		Email:    req.Email,
	}

	if err := h.validate.Struct(req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errFirst := validationErrors[0]
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"code": fiber.StatusBadRequest, "message": format.FormatError(errFirst)})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"code": fiber.StatusBadRequest, "message": "Invalid request."})
	}

	if err := h.service.CreateUser(user); err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"code": fiber.StatusOK, "message": "Registration success."})
}

func (h *UserHandler) HandleLogin(c fiber.Ctx) error {
	var req domain.UserLoginReq
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"code": fiber.StatusBadRequest, "message": "Failed to parse body."})
	}

	if err := h.validate.Struct(req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errFirst := validationErrors[0]
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"code": fiber.StatusBadRequest, "message": format.FormatError(errFirst)})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"code": fiber.StatusBadRequest, "message": "Invalid request."})
	}

	user, err := h.service.Login(req.Identifier, req.Password)
	if err != nil {
		return format.ErrorResponse(c, err)
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		log.Printf("Error when trying to generate token: %v.\n", err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"code": fiber.StatusInternalServerError, "message": "Internal server error."})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   os.Getenv("PRODUCTION_MODE") == "true",
		SameSite: "Lax",
		Path:     "/",
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"code": fiber.StatusOK, "message": "Login success.", "token": token})
}

func (h *UserHandler) HandleGetMe(c fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
	}
	res, err := h.service.GetProfile(uid)
	if err != nil {
		return format.ErrorResponse(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"data": res})
}

func (h *UserHandler) Logout(c fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HTTPOnly: true,
		Secure:   (os.Getenv("PRODUCTION_MODE") == "true"),
		SameSite: "Lax",
		Path:     "/",
	})
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"code":    fiber.StatusOK,
		"message": "Logged out from server",
	})
}
