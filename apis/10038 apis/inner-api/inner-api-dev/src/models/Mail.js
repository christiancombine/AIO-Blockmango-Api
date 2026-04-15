const Model = require("@models/Model");

module.exports = class Mail extends Model {
    constructor() {
        super();

        this.id = 0;
        this.title = "";
        this.content = "";
        this.sendDate = 0;
        this.status = 0;
        this.type = 0;
        this.attachment = [];
        this.extra = "";
    }

    /** @returns {Mail} */
    static fromJson(json) {
        return super.fromJson(Mail, json);
    }

    setId(id) {
        this.id = id;
    }
    
    getId() {
        return this.id;
    }

    setTitle(title) {
        this.title = title;
    }

    getTitle() {
        return this.title;
    }

    setContent(content) {
        this.content = content;
    }

    getContent() {
        return this.content;
    }

    sendSentDate(sentDate) {
        this.sendDate = sentDate;
    }

    getSentDate() {
        return this.sendDate;
    }

    setStatus(status) {
        this.status = status;
    }

    getStatus() {
        return this.status;
    }

    setType(type) {
        this.type = type;
    }

    getType() {
        return this.type;
    }

    setAttachments(attachments) {
        this.attachment = attachments;
    }

    getAttachments() {
        return this.attachment;
    }

    setExtra(extra) {
        this.extra = extra;
    }

    getExtra() {
        return this.extra;
    }
}