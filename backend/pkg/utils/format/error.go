package format

import (
	"errors"
	"fmt"
	"stocks-portfolio-tracker/core/domain"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
)

func FormatError(err validator.FieldError) string {
	field := err.Field()
	param := err.Param()

	switch err.Tag() {
	case "required":
		return fmt.Sprintf("%s must not be empty.", field)
	case "email":
		return "Email format is not valid."
	case "url":
		return fmt.Sprintf("%s must be a valid URL format.", field)
	case "gte", "min":
		if err.Kind().String() == "string" {
			return fmt.Sprintf("%s must be at least %s characters.", field, param)
		}
		return fmt.Sprintf("%s must be at least %s.", field, param)
	case "alphanum":
		return fmt.Sprintf("%s must only contain number and characters.", field)
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s.", field, param)
	case "max", "lte":
		if err.Kind().String() == "string" {
			return fmt.Sprintf("%s must be at most %s characters.", field, param)
		}
		return fmt.Sprintf("%s must be at most %s.", field, param)
	}
	return fmt.Sprintf("%s is invalid.", field)
}

func ErrorResponse(c fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, domain.ErrInvalidInput),
		errors.Is(err, domain.ErrInsufficientAmount),
		errors.Is(err, domain.ErrInsufficientBalance),
		errors.Is(err, domain.ErrMismatchInfo),
		errors.Is(err, domain.ErrInvalidAction),
		errors.Is(err, domain.ErrAlreadyExist):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})

	case errors.Is(err, domain.ErrWrongCredential):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": err.Error()})

	case errors.Is(err, domain.ErrItemNotFound),
		errors.Is(err, domain.ErrUserNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": err.Error()})

	default:
		fmt.Printf("[Internal Server Error] %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": domain.ErrInternalServerError.Error()})
	}
}
