const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class Account extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.email = "";
        this.password = "";
        this.creationTime = 0;
        this.accessToken = "";
        this.loginTime = 0;
    }

    /** @returns {Promise<Account>} */
    static async fromUserId(userId) {
        const account = await mariadb.findFirst(`SELECT * FROM account WHERE userId=${userId}`);
        if (account) return Model.fromJson(Account, account);

        return null;
    }

    async create() {
        await mariadb.executeQuery(`INSERT INTO account VALUES ${super.getSqlCreate()}`);
    }

    async save() {
        await mariadb.executeQuery(`UPDATE account SET ${super.getSqlUpdate()} WHERE userId=${this.userId}`);
    }

    response() {
        return {
            userId: this.userId,
            accessToken: this.accessToken,
            hasPassword: this.password != null
        };
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setEmail(email) {
        this.email = email;
    }

    getEmail() {
        return this.email;
    }

    setPassword(password) {
        this.password = password;
    }

    getPassword() {
        return this.password;
    }

    setCreationTime(creationTime) {
        this.creationTime = creationTime;
    }

    getCreationTime() {
        return this.creationTime;
    }

    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }

    getAccessToken() {
        return this.accessToken;
    }

    setLoginTime(loginTime) {
        this.loginTime = loginTime;
    }

    getLoginTime() {
        return this.loginTime;
    }
}