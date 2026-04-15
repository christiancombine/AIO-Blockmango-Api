const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class ClanNotice extends Model {
    constructor(clanId) {
        super();
        
        this.clanId = clanId;
        this.content = "";
    }

    /** @returns {Promise<ClanNotice>} */
    static async fromClanId(clanId) {
        const clanNotice = await mariadb.findFirst(`SELECT * FROM clan_notice WHERE clanId=${clanId}`);
        if (clanNotice) return Model.fromJson(ClanNotice, clanNotice);

        return new ClanNotice(clanId);
    }

    async save() {
        await mariadb.executeQuery(`INSERT INTO clan_notice VALUES ${super.getSqlCreate()} ON DUPLICATE KEY UPDATE ${super.getSqlUpdate()}`);
    }

    response() {
        return {
            content: this.content
        }
    }

    setClanId(clanId) {
        this.clanId = clanId;
    }

    getClanId() {
        return this.clanId;
    }

    setContent(content) {
        this.content = content;
    }

    getContent() {
        return this.content;
    }
}