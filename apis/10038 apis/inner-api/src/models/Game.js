const mariadb = require("@common/mariadb");
const Model = require("@models/Model");
const Page = require("@models/Page");

module.exports = class Game extends Model {
    constructor() {
        super();

        this.gameId = "";
        this.gameName = "";
        this.iconUrl = "";
        this.isRecommended = false;
        this.gameTypes = [];
        this.likeCount = 0;
        this.shopEnabled = 0;
        this.rankEnabled = 0;
        this.partyEnabled = 0;
        this.authorId = 0;
        this.creationTime = 0;
    }
    
    /** @returns {Promise<Game>} */
    static async fromGameId(gameId) {
        const game = await mariadb.findFirst(`SELECT * FROM game WHERE gameId="${gameId}"`);
        if (game) return Model.fromJson(Game, game);

        return null;
    }

    /** @returns {Promise<Page>} */
    static async listGames(pageNo, pageSize) {
        const totalSize = await mariadb.findFirst(`SELECT COUNT(1) FROM game`, "COUNT(1)", 0);
        
        const startIndex = Page.getStartIndex(pageNo, pageSize);
        const rows = await mariadb.executeQuery(`SELECT * FROM game LIMIT ${pageSize} OFFSET ${startIndex}`);
        for (let i = 0; i < rows.length; i++) {
            rows[i] = Model.fromJson(Game, rows[i]).response();
        }

        return new Page(rows, totalSize, pageNo, pageSize);
    }

    /** @returns {Promise<List<Game>>} */
    static async listPartyGames() {
        const rows = await mariadb.executeQuery(`SELECT * FROM game WHERE partyEnabled=1`);
        for (let i = 0; i < rows.length; i++) {
            rows[i] = Model.fromJson(Game, rows[i]);
        }

        return rows;
    }

    response() {
        return {
            gameId: this.gameId,
            gameTitle: this.gameName,
            gameCoverPic: this.iconUrl,
            gameTypes: this.gameTypes,
            praiseNumber: this.likeCount
        }
    }

    setGameId(gameId) {
        this.gameId = gameId;
    }

    getGameId() {
        return this.gameId;
    }

    setGameName(gameName) {
        this.gameName = gameName;
    }

    getGameName() {
        return this.gameName;
    }

    setIconUrl(iconUrl) {
        this.iconUrl = iconUrl;
    }

    getIconUrl() {
        return this.iconUrl;
    }

    setIsRecommended(isRecommended) {
        this.isRecommended = isRecommended;
    }

    getIsRecommended() {
        return this.isRecommended;
    }

    setGameTypes(gameTypes) {
        this.gameTypes = gameTypes;
    }

    getGameTypes() {
        return this.gameTypes;
    }

    setLikeCount(likeCount) {
        this.likeCount = likeCount;
    }

    getLikeCount() {
        return this.likeCount;
    }

    setShopEnabled(shopEnabled) {
        this.shopEnabled = shopEnabled;
    }

    getShopEnabled() {
        return this.shopEnabled;
    }

    setRankEnabled(rankEnabled) {
        this.rankEnabled = rankEnabled;
    }

    getRankEnabled() {
        return this.rankEnabled;
    }

    setPartyEnabld(partyEnabled) {
        this.partyEnabled = partyEnabled;
    }

    getPartyEnabled() {
        return this.partyEnabled;
    }

    setAuthorId(authorId) {
        this.authorId = authorId;
    }

    getAuthorId() {
        return this.authorId;
    }

    setCreationTime(creationTime) {
        this.creationTime = creationTime;
    }
}