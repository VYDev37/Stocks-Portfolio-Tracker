package middleware

import (
	"fmt"
	"os"
	"strings"
	"time"
	"stocks-portfolio-tracker/pkg/utils/auth"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		tokenStr := c.Cookies("token")

		if tokenStr == "" {
			header := c.Get("Authorization")
			if header != "" {
				tokenStr = strings.Replace(header, "Bearer ", "", 1)
			}
		}

		if tokenStr == "" {
			return c.Status(401).JSON(fiber.Map{"message": "Unauthorized."})
		}

		tokenStr = strings.Replace(tokenStr, "Bearer ", "", 1)
		var claims auth.AuthClaims
		token, err := jwt.ParseWithClaims(tokenStr, &claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.Cookie(&fiber.Cookie{
				Name:     "token",
				Value:    "",
				Expires:  time.Unix(0, 0),
				Path:     "/",
				HTTPOnly: true,
				Secure:   (os.Getenv("PRODUCTION_MODE") == "true"),
				SameSite: "Lax",
			})
			return c.Status(401).JSON(fiber.Map{"message": "Invalid token."})
		}

		if claims.UserID == 0 {
			return c.Status(401).JSON(fiber.Map{"message": "User ID missing from claims."})
		}

		c.Locals("user_id", uint64(claims.UserID))
		return c.Next()
	}
}
