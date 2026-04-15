const service = require("@discord-service/service");

async function getDiscordBindingStatus(request) {
    return await service.getDiscordBindingStatus(request.query.connectId);
}

module.exports = [
    {
        "path": "/discord/api/v1/bind/status",
        "methods": ["GET"],
        "functions": [getDiscordBindingStatus]
    }
]