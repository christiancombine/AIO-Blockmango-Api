const mariadb = require("@common/mariadb");
const Model = require("@models/Model");
const Page = require("@models/Page");

module.exports = class FriendRequest extends Model {
    constructor() {
        super();

        this.requestId = null; // Auto increment
        this.userId = 0;
        this.friendId = 0;
        this.message = "";
        this.picUrl = "";
        this.nickName = "";
        this.sex = 0;
        this.country = "";
        this.language = "";
        this.status = 0;
        this.creationTime = 0;
    }

    /** @returns {Promise<List<FriendRequest>>} */
    static async listFromUserId(userId, pageNo, pageSize) {
        const totalSize = await mariadb.findFirst(`SELECT COUNT(1) FROM friend_request WHERE userId=${userId}`, "COUNT(1)", 0);
        
        const startIndex = Page.getStartIndex(pageNo, pageSize);
        const rows = await mariadb.executeQuery(`SELECT * FROM friend_request WHERE userId=${userId} ORDER BY creationTime DESC LIMIT ${pageSize} OFFSET ${startIndex}`);
        for (let i = 0; i < rows.length; i++) {
            rows[i] = Model.fromJson(FriendRequest, rows[i]).response();
        }

        return new Page(rows, totalSize, pageNo, pageSize);
    }

    /** @returns {Promise<FriendRequest>} */
    static async fromFriendId(userId, friendId) {
        const friendRequest = await mariadb.findFirst(`SELECT * FROM friend_request WHERE userId=${userId} AND friendId=${friendId}`);
        if (friendRequest) return Model.fromJson(FriendRequest, friendRequest);

        return null;
    }
    
    async save() {
        await mariadb.executeQuery(`INSERT INTO friend_request VALUES ${super.getSqlCreate()} ON DUPLICATE KEY UPDATE status=${this.status}`);
    }

    response() {
        return {
            msg: this.message,
            nickName: this.nickName,
            picUrl: this.picUrl,
            requestId: this.requestId,
            status: this.status,
            userId: this.friendId,
            language: this.language,
            country: this.country,
            sex: this.sex
        }
    }

    setRequestId(requestId) {
        this.requestId = requestId;
    }

    getRequestId() {
        return this.requestId;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setFriendId(friendId) {
        this.friendId = friendId;
    }

    getFriendId() {
        return this.friendId;
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

    setSex(sex) {
        this.sex = sex;
    }

    getSex() {
        return this.sex;
    }

    setCountry(country) {
        this.country = country;
    }
    
    getCountry() {
        return this.country;
    }

    setLanguage(language) {
        this.language = language;
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