const mariadb = require("@common/mariadb");
const MailStatuses = require("@constants/MailStatuses");
const Mail = require("@models/Mail");
const MailStatus = require("@models/MailStatus");

/** @returns {Promise<Mail[]>} */
async function getMailboxByUserId(userId, removeReadMails) {
    let userMails = await mariadb.findFirst(`SELECT * FROM mailbox WHERE userId=${userId}`, "data", []);
    let globalMails = await mariadb.findFirst(`SELECT * FROM mailbox WHERE userId=0`, "data", []);

    const mails = userMails.concat(globalMails);
    for (let i = 0; i < mails.length; i++) {
        mails[i] = Mail.fromJson(mails[i]);
    }

    let readMails = await mariadb.findFirst(`SELECT * FROM mailbox_record WHERE userId=${userId}`, "data", []);
    for (let i = 0; i < readMails.length; i++) {
        readMails[i] = MailStatus.fromJson(readMails[i]);
    }

    for (var i = 0; i < mails.length; i++) {
        for (var j = 0; j < readMails.length; j++) {
            if (mails[i].getId() == readMails[j].getId()) {
                mails[i].setStatus(readMails[j].getStatus());
            }
        }
    }

    for (var i = 0; i < mails.length; i++) {
        if (mails[i].status == MailStatuses.DELETE) {
            mails.splice(i, 1);
        }

        if (removeReadMails && mails[i].status == MailStatuses.READ) {
            mails.splice(i, 1);
        }
    }
    
    return mails;
}

module.exports = {
    getMailboxByUserId: getMailboxByUserId
}