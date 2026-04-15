const { dirname } = require("path");

const wealthTypes = {
    "0": "all",
    "1": "diamonds",
    "2": "golds",
    "3": "clanGolds"
}

module.exports = {
    ROOT_DIRECTORY: `${dirname(require.main.filename)}/..`,

    CACHE_USER_DONATION_CURRENCY: "cache.donation.%s.%s",
    CACHE_USER_DONATION_TASK: "cache.donation.task.%s",
    CACHE_ACTIVITY_FREE_WHEEL: "cache.activity.wheel.free.%s",
    CACHE_GAME_ACCOUNT: "cache.game.token.%s",

    SIGNATURE_EXPIRE_TIME: 120,
    
    WEALTH_TYPES: wealthTypes
}