const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class Wealth extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.golds = 0;
        this.diamonds = 0;
        this.clanGolds = 0;
    }

    /** @returns {Promise<Wealth>} */
    static async fromUserId(userId) {
        const rows = await mariadb.executeQuery(`SELECT * FROM wealth WHERE userId=${userId}`);
        const wealth = rows[0] ?? null;
        if(wealth) {
            return Model.fromJson(Wealth, wealth);
        }
        
        return new Wealth(userId);
    }
    
    async save() {
        await mariadb.executeQuery(`INSERT INTO wealth VALUES ${super.getSqlCreate()} ON DUPLICATE KEY UPDATE ${super.getSqlUpdate()}`);
    }

    setGold(gold) {
        this.golds = gold;
    }

    getGold() {
        return this.golds;
    }

    setDiamonds(diamonds) {
        this.diamonds = diamonds;
    }

    getDiamonds() {
        return this.diamonds;
    }

    setClanGolds(clanGold) {
        this.clanGolds = clanGold;
    }

    getClanGolds() {
        return this.clanGolds;
    }
}