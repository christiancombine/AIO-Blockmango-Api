const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class Localization extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.language = "";
        this.country = "";
    }

    /** @returns {Promise<Localization>} */
    static async fromUserId(userId) {
        const vip = await mariadb.findFirst(`SELECT * FROM user_locale WHERE userId=${userId}`);
        if (vip) return Model.fromJson(Localization, vip);

        return new Localization(userId);
    }

    async create() {
        await mariadb.executeQuery(`INSERT INTO user_locale VALUES ${super.getSqlCreate()}`);
    }

    async save() {
        await mariadb.executeQuery(`UPDATE user_locale SET ${super.getSqlUpdate()} WHERE userId=${this.userId}`);
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setLanguage(language) {
        this.language = language;
    }

    getLanguage() {
        return this.language;
    }

    setCountry(country) {
        this.country = country;
    }

    getCountry() {
        return this.country;
    }
}