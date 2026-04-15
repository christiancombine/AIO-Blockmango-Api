const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class Vip extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.vip = 0;
        this.expireDate = 0;
    }

    /** @returns {Promise<Vip>} */
    static async fromUserId(userId) {
        const rows = await mariadb.executeQuery(`SELECT * FROM vip WHERE userId=${userId}`);
        const vip = rows[0] ?? null;
        if(vip) {
            return Model.fromJson(Vip, vip);
        }

        return new Vip(userId);
    }

    async create() {
        await mariadb.executeQuery(`INSERT INTO vip VALUES ${super.getSqlCreate()}`);
    }

    async save() {
        await mariadb.executeQuery(`UPDATE vip SET ${super.getSqlUpdate()} WHERE userId=${this.userId}`);
    }

    response() {
        return {
            vip: this.vip,
            expireDate: this.expireDate
        }
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setLevel(vip) {
        this.vip = vip;
    }

    getLevel() {
        return this.vip;
    }

    setExpireDate(expireDate) {
        this.expireDate = expireDate;
    }

    getExpireDate() {
        return this.expireDate;
    }
}