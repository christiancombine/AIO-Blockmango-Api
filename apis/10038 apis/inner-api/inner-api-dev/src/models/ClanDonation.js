const redis = require("@common/redis");
const constants = require("@common/constants");
const mariadb = require("@common/mariadb");
const clanConfig = require("@config/clan");
const Currencies = require("@constants/Currencies");
const Clan = require("@models/Clan");
const Model = require("@models/Model");
const Page = require("@models/Page");
const Vip = require("@models/Vip");

module.exports = class ClanDonation extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.clanId = 0;
        this.nickName = "";
        this.type = 0;
        this.amount = 0;
        this.expReward = 0;
        this.clanGoldReward = 0;
        this.creationTime = 0;
    }


    static async historyFromClanId(clanId, pageNo, pageSize) {
        const totalSize = await mariadb.findFirst(`SELECT COUNT(1) FROM clan_donation WHERE clanId=${clanId}`, "COUNT(1)", 0);
        
        const startIndex = Page.getStartIndex(pageNo, pageSize);
        const rows = await mariadb.executeQuery(`SELECT * FROM clan_donation WHERE clanId=${clanId} ORDER BY creationTime DESC LIMIT ${pageSize} OFFSET ${startIndex}`);
        for (let i = 0; i < rows.length; i++) {
            rows[i] = Model.fromJson(ClanDonation, rows[i]).response();
        }

        return new Page(rows, totalSize, pageNo, pageSize);
    }

    async getInfo() {
        if (this.clanId == 0) {
            return;
        }

        const vip = await Vip.fromUserId(this.userId);
        const clan = await Clan.fromClanId(this.clanId);
        const clanLevelConfig = clanConfig.levels[clan.level];

        const currentGold = await redis.getKey(constants.CACHE_USER_DONATION_CURRENCY, Currencies.GOLD, this.userId) ?? 0;
        const currentDiamonds = await redis.getKey(constants.CACHE_USER_DONATION_CURRENCY, Currencies.DIAMOND, this.userId) ?? 0;
        const currentTasks = await redis.getKey(constants.CACHE_USER_DONATION_TASK, this.userId) ?? 0;
        
        return {
            currentGold: currentGold,
            currentDiamond: currentDiamonds,
            currentTask: currentTasks,
            currentExperience: clan.experience,
            clanId: clan.clanId,
            level: clan.level,
            maxDiamond: clanLevelConfig.maxDiamondDonate * clanConfig.vipBoosts[vip.getLevel()].maxDiamondDonate,
            maxExperience: clanLevelConfig.upgradeExperience,
            maxGold: clanLevelConfig.maxGoldDonate * clanConfig.vipBoosts[vip.getLevel()].maxGoldDonate,
            maxTask: clanLevelConfig.personalTaskCount + clanLevelConfig.clanTaskCount
        }
    }

    async save() {
        await redis.setKey({
            key: constants.CACHE_USER_DONATION_CURRENCY,
            params: [this.type, this.userId] 
        }, this.amount, 86400);

        await mariadb.executeQuery(`INSERT INTO clan_donation VALUES ${super.getSqlCreate()}`);
    }

    response() {
        return {
            date: this.creationTime,
            experienceGot: this.expReward,
            nickName: this.nickName,
            quantity: this.amount,
            tribeCurrencyGot: this.clanGoldReward,
            type: this.type,
            userId: this.userId
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

    setAmount(amount) {
        this.amount = amount;
    }

    getAmount() {
        return this.amount;
    }

    setExpReward(expReward) {
        this.expReward = expReward;
    }

    getExpReward() {
        return this.expReward;
    }

    setClanGoldReward(clanGoldReward) {
        this.clanGoldReward = clanGoldReward;
    }

    getClanGoldReward() {
        return this.clanGoldReward;
    }

    setCreationTime(creationTime) {
        this.creationTime = creationTime;
    }

    getCreationTime() {
        return this.creationTime;
    }
}