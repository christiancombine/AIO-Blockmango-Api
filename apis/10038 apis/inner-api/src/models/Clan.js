const mariadb = require("@common/mariadb");
const clanConfig = require("@config/clan");
const ClanRoles = require("@constants/ClanRoles");
const Model = require("@models/Model");
const ClanMember = require("@models/ClanMember");
const Page = require("@models/Page");

module.exports = class Clan extends Model {
    constructor(clanId) {
        super();

        this.clanId = clanId;
        this.name = "";
        this.picUrl = "";
        this.tags = [];
        this.details = "";
        this.experience = 0;
        this.level = 1;
        this.memberCount = 0;
        this.freeVerify = 0;
        this.language = "";
        this.creationTime = 0;
    }

    /** @returns {Promise<Clan>} */
    static async fromClanId(clanId) {
        const clan = await mariadb.findFirst(`SELECT * FROM clan WHERE clanId=${clanId}`);
        if (clan) return Model.fromJson(Clan, clan);

        return null;
    }

    /** @returns {Promise<Page>}  */
    static async search(clanId, query, pageNo, pageSize) {
        const totalSize = await mariadb.findFirst(`SELECT COUNT(1) FROM clan WHERE name LIKE "${query}%" AND NOT clanId=${clanId}`, "COUNT(1)", 0);

        const startIndex = Page.getStartIndex(pageNo, pageSize);
        const rows = await mariadb.executeQuery(`SELECT * FROM clan WHERE name LIKE "${query}%" AND NOT clanId=${clanId} LIMIT ${pageSize} OFFSET ${startIndex}`);
        for (let i = 0; i < rows.length; i++) {
            rows[i] = Model.fromJson(Clan, rows[i]).response();
        }

        return new Page(rows, totalSize, pageNo, pageSize);
    }

    /** @returns {Promise<Boolean>} */
    static async exists(clanId) {
        const count = await mariadb.findFirst(`SELECT COUNT(1) FROM clan WHERE clanId=${clanId}`, "COUNT(1)", 0);
        return count == 1;
    }

    async addMember(userId, role) {
        const clanMember = new ClanMember(userId);
        clanMember.setClanId(this.clanId);
        clanMember.setRole(role);

        await clanMember.save();
        this.memberCount += 1;
    }

    async removeMember(userId) {
        const clanMember = await ClanMember.fromUserId(userId);
        if (clanMember.getClanId() != this.clanId) {
            return false;
        }

        await clanMember.delete();
        this.memberCount -= 1;

        return true;
    }

    /** @returns {Promise<List<ClanMember>>} */
    async getMembers(onlyAuthorities) {
        const members = [];
        
        const rows = await mariadb.executeQuery(`SELECT * FROM clan_member WHERE clanId=${this.clanId} ${onlyAuthorities ? `AND role>${ClanRoles.MEMBER}` : ``}`);
        for (let i = 0; i < rows.length; i++) {
            const memberData = await Model.fromJson(ClanMember, rows[i]).getInfo();
            members.push(memberData);
        }

        return members;
    }

    /** @returns {Promise<Number>} */
    async getElderCount() {
        return await mariadb.findFirst(`SELECT COUNT(1) FROM clan_member WHERE clanId=${this.clanId} AND role=${ClanRoles.ELDER}`, "COUNT(1)", 0);
    }
    
    addExperience(experience) {
        this.experience += experience;
        
        const clanLevelConfig = clanConfig.levels[this.level];
        if (clanLevelConfig.upgradeExperience != null && this.experience >= clanLevelConfig.upgradeExperience) {
            this.level += 1;
        }
    }

    async create() {
        await mariadb.executeQuery(`INSERT INTO clan VALUES ${super.getSqlCreate()}`);
    }

    async save() {
        await mariadb.executeQuery(`UPDATE clan SET ${super.getSqlUpdate()} WHERE clanId=${this.clanId}`);
    }

    async delete() {
        // TODO: Delete keys related to the clan
    }

    response(shownMembers) {
        return {
            clanId: this.clanId,
            currentCount: this.memberCount,
            details: this.details,
            experience: this.experience,
            headPic: this.picUrl,
            level: this.level,
            name: this.name,
            maxCount: clanConfig.levels[this.level].maxCount,
            clanMembers: shownMembers,
            tags: this.tags,
            freeVerify: this.freeVerify
        }
    }

    setClanId(clanId) {
        this.clanId = clanId;
    }

    getClanId() {
        return this.clanId;
    }

    setName(name) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    getMemberCount() {
        return this.memberCount;
    }

    setDetails(details) {
        this.details = details;
    }

    getDetails() {
        return this.details;
    }

    setExperience(experience) {
        this.experience = experience;
    }

    getExperience() {
        return this.experience;
    }

    setProfilePic(picUrl) {
        this.picUrl = picUrl;
    }

    getProfilePic() {
        return this.picUrl;
    }

    setLevel(level) {
        this.level = level;
    }

    getLevel() {
        return this.level;
    }

    setTags(tags) {
        this.tags = tags;
    }

    getTags() {
        return this.tags;
    }

    setVerification(freeVerify) {
        this.freeVerify = freeVerify;
    }

    getVerification() {
        return this.freeVerify;
    }

    setCreationTime(creationTime) {
        this.creationTime = creationTime;
    }

    getCreationTime() {
        return this.creationTime;
    }
}