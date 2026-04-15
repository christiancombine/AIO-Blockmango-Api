const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class GameDetail extends Model {
    constructor() {
        super();

        this.gameId = "";
        this.bannerUrl = "";
        this.gameDetail = "";
        this.featuredPlay = [];
    }

    /** @returns {Promise<GameDetail>} */
    static async fromGameId(gameId) {
        const gameDetail = await mariadb.findFirst(`SELECT * FROM game_detail WHERE gameId="${gameId}"`);
        if (gameDetail) return Model.fromJson(GameDetail, gameDetail);

        return null;
    }
}