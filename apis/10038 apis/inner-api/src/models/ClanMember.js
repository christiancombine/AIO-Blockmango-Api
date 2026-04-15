const mariadb = require("@common/mariadb");
const ClanRoles = require("@constants/ClanRoles");
const Model = require("@models/Model");
const User = require("@models/User");
const Vip = require("@models/Vip");

module.exports = class ClanMember extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.clanId = 0;
        this.role = ClanRoles.INVALID;
        this.experience = 0;
    }

    /** @returns {Promise<ClanMember>} */
    static async fromUserId(userId) {
        const clanMember = await mariadb.findFirst(`SELECT * FROM clan_member WHERE userId=${userId}`);
        if (clanMember) return Model.fromJson(ClanMember, clanMember);
        
        return new ClanMember(userId);
    }

    async getInfo() {
        if (!this.clanId) {
            return null;
        }

        const user = await User.fromUserId(this.userId);
        const vip = await Vip.fromUserId(this.userId);

        return {
            userId: this.userId,
            clanId: this.clanId,
            role: this.role,
            experience: this.experience,
            expireDate: vip.getExpireDate(),
            headPic: user.getProfilePic(),
            nickName: user.getNickname(),
            vip: vip.getLevel()
        }
    }

    addExperience(experience) {
        this.experience += experience;
    }

    async save() {
        await mariadb.executeQuery(`INSERT INTO clan_member VALUES ${super.getSqlCreate()} ON DUPLICATE KEY UPDATE ${super.getSqlUpdate()}`);
    }

    async delete() {
        await mariadb.executeQuery(`DELETE FROM clan_member WHERE userId=${this.userId}`);
    }

    response() {
        return {
            userId: this.userId,
            clanId: this.clanId,
            role: this.role
        }
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

    setRole(role) {
        this.role = role;
    }

    setExperience(experience) {
        this.experience = experience;
    }

    getExperience() {
        return this.experience;
    }
}