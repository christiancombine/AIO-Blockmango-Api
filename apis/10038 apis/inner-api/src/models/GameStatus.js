const Model = require("@models/Model");

module.exports = class GameStatus extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.status = 0;
        this.gameId = "";
        this.gameName = "";
    }
}