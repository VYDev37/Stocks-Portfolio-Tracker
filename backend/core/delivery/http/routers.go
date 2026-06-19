package http

import (
	"fmt"
	"os"
	"strings"

	"trade-tracker/core/delivery/handlers"
	"trade-tracker/core/services"
	"trade-tracker/pkg/middleware"

	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/helmet"
	"github.com/gofiber/fiber/v3/middleware/limiter"
)

func InitRoutes(uService services.UserService, pService services.PositionService,
	tService services.TransactionService, nService services.NoteService,
	bService services.BalanceService, rService services.ReportService, aService services.AssetService) *fiber.App {
	app := fiber.New()
	originsEnv := os.Getenv("ALLOW_ORIGINS")
	var origins []string
	if originsEnv != "" {
		for _, o := range strings.Split(originsEnv, ",") {
			origins = append(origins, strings.TrimSpace(o))
		}
	} else {
		origins = []string{"http://localhost:3000", "https://tpt-v3.vercel.app"}
	}

	app.Use(helmet.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		AllowCredentials: true,
	}))

	app.Use(func(c fiber.Ctx) error {
		if c.Method() == "OPTIONS" {
			c.Set("Access-Control-Allow-Origin", c.Get("Origin"))
			c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS")
			c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
			c.Set("Access-Control-Allow-Credentials", "true")
			return c.SendStatus(fiber.StatusNoContent)
		}
		return c.Next()
	})

	app.Options("/*", func(c fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNoContent)
	})

	app.Use(func(c fiber.Ctx) error {
		fmt.Printf("Method: %s, Path: %s, Origin: %s\n", c.Method(), c.Path(), c.Get("Origin"))
		return c.Next()
	})

	api := app.Group(os.Getenv("API_GROUP_NAME"))
	
	// General Rate Limiter (100 reqs / min)
	api.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 1 * time.Minute,
	}))
	
	api.Get("/", func(c fiber.Ctx) error {
		return c.SendString("Hello World!")
	})

	// Strict Auth Rate Limiter (5 reqs / 15 min)
	authLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 15 * time.Minute,
	})

	accountApi := api.Group("/account")
	userService := handlers.NewUserHandler(uService)

	accountApi.Post("/register", authLimiter, userService.HandleRegister)
	accountApi.Post("/login", authLimiter, userService.HandleLogin)
	accountApi.Post("/logout", userService.Logout)

	userApi := api.Group("/user", middleware.AuthMiddleware())

	userApi.Get("/me", userService.HandleGetMe)

	positionApi := api.Group("/position", middleware.AuthMiddleware())
	positionService := handlers.NewPositionHandler(pService)

	positionApi.Post("/add/:type", positionService.HandleAddPosition)
	positionApi.Get("/get-price/:ticker", positionService.HandleGetTickerMarketPrice)
	positionApi.Get("/portfolio", positionService.HandleGetPortfolio)
	positionApi.Post("/migrate", positionService.HandleMigratePositions)

	trxApi := api.Group("/transactions", middleware.AuthMiddleware())
	trxService := handlers.NewTransactionHandler(tService)

	trxApi.Get("/my-info", trxService.HandleGetLocalTransaction)
	trxApi.Put("/update/:id", trxService.HandleUpdateTransaction)
	trxApi.Post("/migrate", trxService.HandleMigrateTransactions)

	noteApi := api.Group("/notes", middleware.AuthMiddleware())
	noteService := handlers.NewNoteHandler(nService)

	noteApi.Get("/get", noteService.HandleGetNotes)
	noteApi.Post("/add", noteService.HandleAddNote)
	noteApi.Delete("/remove/:nId", noteService.HandleRemoveNote)
	noteApi.Put("/update/:nId", noteService.HandleUpdateNote)

	balanceApi := api.Group("/balance", middleware.AuthMiddleware())
	balanceService := handlers.NewBalanceHandler(bService)

	balanceApi.Post("/update-balance", balanceService.HandleUpdateBalance)
	balanceApi.Get("/accounts/:type", balanceService.HandleGetAccountsByType)

	reportApi := api.Group("/report", middleware.AuthMiddleware())
	reportService := handlers.NewReportHandler(rService)

	reportApi.Get("/get", reportService.ExportProfile)

	assetApi := api.Group("/asset", middleware.AuthMiddleware())
	assetService := handlers.NewAssetHandler(aService)

	assetApi.Get("/get-items", assetService.HandleGetAssets)
	assetApi.Get("/get-items-us", assetService.HandleGetUSAssets)
	assetApi.Get("/get-item/:ticker", assetService.HandleGetAsset)
	assetApi.Get("/get-chart/:ticker", assetService.HandleGetAssetChart)

	workerGroup := app.Group("/worker")
	workerGroup.Get("/update-prices", assetService.HandleUpdateStock)     // IDX (backward-compat)
	workerGroup.Get("/update-prices-us", assetService.HandleUpdateUSStock) // US (new)

	return app
}
