const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class User extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.nickName = "";
        this.sex = 0;
        this.picUrl = "";
        this.details = "";
        this.birthday = "";
        this.isFreeNickname = true;
    }

    /** @returns {Promise<User>} */
    static async fromUserId(userId) {
        const user = await mariadb.findFirst(`SELECT * FROM user WHERE userId=${userId}`);
        if (user) return Model.fromJson(User, user);

        return null;
    }

    /** @returns {Promise<Boolean>} */
    static async exists(userId) {
        const rows = await mariadb.executeQuery(`SELECT COUNT(1) FROM user WHERE userId=${userId}`);
        return rows[0]["COUNT(1)"] == 1;
    }

    async create() {
        await mariadb.executeQuery(`INSERT INTO user VALUES ${super.getSqlCreate()}`);
    }

    async save() {
        await mariadb.executeQuery(`UPDATE user SET ${super.getSqlUpdate()} WHERE userId=${this.userId}`);
    }

    response() {
        return {
            userId: this.userId,
            nickName: this.nickName,
            sex: this.sex,
            picUrl: this.picUrl,
            details: this.details,
            birthday: this.birthday
        }
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
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

    setProfilePic(picUrl) {
        this.picUrl = picUrl;
    }

    getProfilePic() {
        return this.picUrl;
    }

    setDetails(details) {
        this.details = details;
    }

    getDetails() {
        return this.details;
    }
 
    setBirthday(birthday) {
        this.birthday = birthday;
    }

    getBirthday() {
        return this.birthday;
    }

    setIsFreeNickname(isFreeNickname) {
        this.isFreeNickname = isFreeNickname;
    }

    getIsFreeNickname() {
        return this.isFreeNickname;
    }
}