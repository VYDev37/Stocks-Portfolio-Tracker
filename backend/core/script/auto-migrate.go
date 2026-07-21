package main

import (
	"log"
	"os"

	"stocks-portfolio-tracker/core/config"
	"stocks-portfolio-tracker/core/domain"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	dsn := os.Getenv("DB_CONNECTION")
	db, err := config.InitDBConnection(dsn)
	if err != nil {
		log.Fatalf("Failed to establish connection: %v.\n", err)
	}

	log.Println("Migrating database...")

	if err := db.AutoMigrate(
		&domain.User{},
		&domain.Position{},
		&domain.Transaction{},
		&domain.Note{},
		&domain.Balance{},
		&domain.Asset{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v.\n", err)
	}

	log.Println("Database has been migrated!")
}
