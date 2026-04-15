const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class GameLike extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.games = [];
    }

    static async fromUserId(userId) {
        const gameLike = await mariadb.findFirst(`SELECT * FROM game_like WHERE userId=${userId}`);
        if (gameLike) return Model.fromJson(GameLike, gameLike);

        return new GameLike(userId);
    }

    response(gameId) {
        return {
            appreciate: this.games.includes(gameId)
        }
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setGames(games) {
        this.games = games;
    }

    getGames() {
        return this.games;
    }
}