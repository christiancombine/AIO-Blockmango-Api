const constants = require("@common/constants");
const redis = require("@common/redis");
const Model = require("@models/Model");

module.exports = class GameAccount extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.accessToken = "";
        this.timestamp = 0;
    }

    /** @returns {Promise<GameAccount>} */
    static async fromUserId(userId) {
        const gameAccount = await redis.getKey(constants.CACHE_GAME_ACCOUNT, userId);
        if (gameAccount) return Model.fromJson(GameAccount, JSON.parse(gameAccount));

        return new GameAccount(userId);
    }

    async save() {
        await redis.setKey({
            key: constants.CACHE_GAME_ACCOUNT,
            params: [this.userId]
        }, JSON.stringify(this), 600);
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }

    getAccessToken() {
        return this.accessToken;
    }

    setTimestamp(timestamp) {
        this.timestamp = timestamp;
    }

    getTimestamp() {
        return this.timestamp;
    }
}