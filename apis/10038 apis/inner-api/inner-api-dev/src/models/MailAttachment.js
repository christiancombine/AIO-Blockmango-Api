const Model = require("@models/Model");

module.exports = class MailAttachment extends Model {
    constructor() {
        super();

        this.name = "";
        this.qty = 0;
        this.icon = "";
        this.itemId = "";
        this.type = 0;

        this.vipLevel = 0;
        this.vipDuration = 0; // in days
    }

    /** @returns {MailAttachment} */
    static fromJson(json) {
        return super.fromJson(MailAttachment, json);
    }

    setName(name) {
        this.name = name;
    }
    
    getName() {
        return this.name;
    }

    setQuantity(quantity) {
        this.qty = quantity;
    }

    getQuantity() {
        return this.qty;
    }

    setIcon(icon) {
        this.icon = icon;
    }

    getIcon() {
        return this.icon;
    }

    setItemId(itemId) {
        this.itemId = itemId;
    }

    getItemId() {
        return this.itemId;
    }

    setType(type) {
        this.type = type;
    }

    getType() {
        return this.type;
    }

    setVipLevel(vipLevel) {
        this.vipLevel = vipLevel;
    }

    getVipLevel() {
        return this.vipLevel;
    }

    setVipDuration(vipDuration) {
        this.vipDuration = vipDuration;
    }

    getVipDuration() {
        return this.vipDuration;
    }
}