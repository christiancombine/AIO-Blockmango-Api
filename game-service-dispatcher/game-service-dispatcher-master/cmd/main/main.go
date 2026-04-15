package main

import (
	"bmf/disp/configs"
	"bmf/disp/internal/routes"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	router := gin.New()

	// Remove in Production
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	routes.SetupRoutes(router)

	dispatchPort := fmt.Sprintf(":%d", cfg.HostConfig.DispPort)
	router.Run(dispatchPort)
}
