const mariadb = require("@common/mariadb");
const Model = require("@models/Model");
const Page = require("@models/Page");

module.exports = class Transaction extends Model {
    constructor(data) {
        super();

        data = data ?? {};

        this.userId = data.userId ?? 0;
        this.created = data.created ?? "";
        this.currency = data.currency ?? 0;
        this.inoutType = data.inoutType ?? 0;
        this.orderId = data.orderId ?? "";
        this.qty = data.quantity ?? 0;
        this.status = data.status ?? 0;
        this.transactionType = data.transactionType ?? 0;
    } 

    static async fromUserId(userId, pageNo, pageSize) {
        const rows_count = await mariadb.executeQuery(`SELECT COUNT(1) FROM wealth_record WHERE userId=${userId}`);
        const totalSize = rows_count[0]["COUNT(1)"];
        
        const startIndex = Page.getStartIndex(pageNo, pageSize);
        const rows = await mariadb.executeQuery(`SELECT * FROM wealth_record WHERE userId=${userId} ORDER BY created DESC LIMIT ${pageSize} OFFSET ${startIndex}`);
        for (let i = 0; i < rows.length; i++) {
            rows[i] = Model.fromJson(Transaction, rows[i]);
        }

        return new Page(rows, totalSize, pageNo, pageSize);
    }

    async save() {
        await mariadb.executeQuery(`INSERT INTO wealth_record VALUES ${super.getSqlCreate()}`);
    }
}