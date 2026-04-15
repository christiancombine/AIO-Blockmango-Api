package routes

import (
	// dispatch_controller "bmf/disp/internal/controllers"

	responses "bmf/disp/pkg/common"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	router.GET("/", func(ctx *gin.Context) {
		ctx.String(responses.Success().Status, "OK")
	})

	router.NoRoute(func(ctx *gin.Context) {
		ctx.JSON(responses.NotFound().Status, responses.NotFound())
	})

	// router.POST("/v1/dispatch", dispatch_controller.DispatchUser())

	// TODO: Implementation Needed (More routes)
}