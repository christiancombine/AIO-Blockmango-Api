const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class AccountBinding extends Model {
    constructor(connectId) {
        super();

        this.userId = 0;
        this.connectId = connectId;
    }

    /** @returns {Promise<AccountBinding>} */
    static async fromConnectId(connectId) {
        const accountBinding = await mariadb.findFirst(`SELECT * FROM account_binding WHERE connectId=${connectId}`);
        if (accountBinding) return Model.fromJson(AccountBinding, accountBinding);

        return new AccountBinding(connectId);
    }

    async save() {
        await mariadb.executeQuery(`INSERT INTO account_binding VALUES ${super.getSqlCreate()}`);
    }

    async delete() {
        await mariadb.executeQuery(`DELETE FROM account_binding WHERE userId=${this.userId}`);
    }

    response() {
        return { userId: this.userId }
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setConnectId(connectId) {
        this.connectId = connectId;
    }

    getConnectId() {
        return this.connectId;
    }
}
