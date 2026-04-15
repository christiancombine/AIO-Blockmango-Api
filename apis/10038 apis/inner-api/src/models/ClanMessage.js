const mariadb = require("@common/mariadb");
const Model = require("@models/Model");
const Page = require("@models/Page");

module.exports = class ClanMessage extends Model {
    constructor(userId) {
        super();

        this.messageId = null;
        this.userId = userId;
        this.clanId = 0;
        this.authorityId = 0;
        this.message = "";
        this.picUrl = "";
        this.nickName = "";
        this.type = 0;
        this.status = 0;
        this.creationTime = 0;
    }

    /** @returns {Promise<Page>} */
    static async listFromFilter(filter, pageNo, pageSize) {
        const totalSize = await mariadb.findFirst(`SELECT COUNT(1) FROM clan_message WHERE ${filter}`, "COUNT(1)", 0);
        const startIndex = Page.getStartIndex(pageNo, pageSize);
        
        if (!filter) {
            filter = "TRUE";
        }

        const rows = await mariadb.executeQuery(`SELECT * FROM clan_message WHERE ${filter} ORDER BY creationTime DESC LIMIT ${pageSize} OFFSET ${startIndex}`); 
        for (let i = 0; i < rows.length; i++) {
            rows[i] = Model.fromJson(ClanMessage, rows[i]).response();
        }

        return new Page(rows, totalSize, pageNo, pageSize);
    }

    /** @returns {Promise<ClanMessage>} */
    static async findFirst(userId, type, status) {
        const message = await mariadb.findFirst(`SELECT * FROM clan_message WHERE userId=${userId} AND type=${type} AND status=${status}`);
        if (message) return Model.fromJson(ClanMessage, message);

        return new ClanMessage(userId);
    }

    async save() {
        await mariadb.executeQuery(`INSERT INTO clan_message VALUES ${super.getSqlCreate()} ON DUPLICATE KEY UPDATE ${super.getSqlUpdate()}`);
    }

    async delete() {
        await mariadb.executeQuery(`DELETE FROM clan_message WHERE messageId=${this.messageId}`);
    }

    response() {
        return {
            clanId: this.clanId,
            headPic: this.picUrl,
            id: this.messageId,
            nickName: this.nickName,
            status: this.status,
            type: this.type,
            userId: this.userId,
            msg: this.message
        }
    }

    getMessageId() {
        return this.messageId;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setClanId(clanId) {
        this.clanId = clanId;
    }

    getClanId() {
        return this.clanId;
    }

    setAuthorityId(authorityId) {
        this.authorityId = authorityId;
    }

    getAuthorityId() {
        return this.authorityId;
    }

    setMessage(message) {
        this.message = message;
    }

    getMessage() {
        return this.message;
    }

    setProfilePic(picUrl) {
        this.picUrl = picUrl;
    }

    getProfilePic() {
        return this.picUrl;
    }

    setNickname(nickName) {
        this.nickName = nickName;
    }

    getNickname() {
        return this.nickName;
    }

    setType(type) {
        this.type = type;
    }

    getType() {
        return this.type;
    }

    setStatus(status) {
        this.status = status;
    }

    getStatus() {
        return this.status;
    }

    setCreationTime(creationTime) {
        this.creationTime = creationTime;
    }

    getCreationTime() {
        return this.creationTime;
    }
}