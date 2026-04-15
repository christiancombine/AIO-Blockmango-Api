const service = require("@pay-service/service");

async function getUserWealth(request) {
    return await service.getUserWealth(request.params.userId);
}

module.exports = [
    {
        "path": "/pay/i/api/v1/wealth/users/:userId",
        "methods": ["GET"],
        "functions": [getUserWealth]
    },
]