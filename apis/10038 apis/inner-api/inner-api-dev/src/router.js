const express = require("express");

const logger = require("@common/logger");
const responses = require("@common/responses");
const middlewares = require("@common/middlewares");
const modules = require("@config/modules");

function init(app) {
    app.use(express.json());

    for (var i = 0; i < modules.length; i++) {
        const endpoints = require(`@${modules[i]}-service/controller`);
        for (var j = 0; j < endpoints.length; j++) {
            createEndpoint(app, endpoints[j]);
        }
    }

    app.all("*", (req, res) => {
        const notFound = responses.notFound();
        logger.warn(`Endpoint may not be implemented: [${req.method}] ${req.url}`);
        logger.warn(`Endpoint headers: ${JSON.stringify(req.headers, null, 4)}`);
        logger.warn(`Endpoint body: ${JSON.stringify(req.body, null, 4)}`)
        res.status(notFound.status).json(notFound.content);
    });
}

function createEndpoint(app, endpoint) {
    app.all(endpoint.path, async (req, res) => {        
        try {
            var startTime = Date.now();
            if (!endpoint.methods.includes(req.method)) {
                const methodNotAllowed = responses.methodNotAllowed();
                logger.warn(`Warning for API: ${req.url}`);
                logger.warn(`Endpoint method (${req.method}) may not be implemented: ${req.url}`);
                logger.warn("Did an endpoint-collision occurred?");
    
                res.status(methodNotAllowed.status).json(methodNotAllowed.content);
                return;
            }

            if (req.method !== "GET") {
                const { hasSucceeded, response: authResponse } = middlewares.innerAuthentication(req);
                if (!hasSucceeded) {
                    res.status(authResponse.status).json(authResponse.content);
                    return;
                }
            }
            
            const response = await endpoint.functions[endpoint.methods.indexOf(req.method)](req);
            res.status(response.status).json(response.content);
            var stopTime = Date.now();
            console.log(`[${req.url}] Sent ${req.method}: ${response.status} Operation took ${stopTime - startTime}ms`);
            if (response.status == 500) {
                console.log("\x1b[91m%s\x1b[0m", `Response: ${JSON.stringify(response.content)}`);
            }
        } catch (e) {
            logger.error(`Error occurred with API: ${req.url}`);
            logger.error(e);

            const innerError = responses.innerError();
            res.status(innerError.status).json(innerError.content);
        }
    });
}

module.exports = init;