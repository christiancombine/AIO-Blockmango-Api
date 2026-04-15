const responses = require("@common/responses");
const Wealth = require("@models/Wealth");

async function getUserWealth(userId) {
    const wealth = await Wealth.fromUserId(userId);
    console.log(responses.success(wealth));
    return responses.success(wealth);
}

module.exports = {
    getUserWealth: getUserWealth,
}