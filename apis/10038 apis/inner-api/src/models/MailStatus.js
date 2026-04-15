const Model = require("@models/Model");

module.exports = class MailStatus extends Model {
    constructor() {
        super();

        this.id = 0;
        this.status = 0;
    }

    /** @returns {MailStatus} */
    static fromJson(json) {
        return super.fromJson(MailStatus, json);
    }

    setId(id) {
        this.id = id;
    }
    
    getId() {
        return this.id;
    }

    setStatus(status) {
        this.status = status;
    }

    getStatus() {
        return this.status;
    }
}