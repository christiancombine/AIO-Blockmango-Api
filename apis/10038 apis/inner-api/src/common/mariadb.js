const logger = require("@common/logger");
const dbConfig = require("@config/database");
const mariadb = require("mariadb");

var pool = null;

function init() {
    pool = mariadb.createPool(dbConfig["mariadb"]);
}

async function executeQuery(query) {
    if (!pool) {
        throw Error("MariaDB is not initialized");
    }

    let conn;
    try {
        conn = await pool.getConnection();
        return await conn.query(query);
    } catch(err) {
        logger.error("An error occurred while using MariaDB");
        logger.error(err);
    } finally {
        if (conn) conn.end();
    }
}

async function insert(table, data) {

}

async function update(table, data) {

}

async function insertOrUpdate(table, insertData, updateData) {

}

async function findFirst(query, key, defaultValue = null) {
    const data = await executeQuery(query);
    if (key == null) {
        return data[0] ?? defaultValue;
    }

    if (data.length > 0 && data[0][key]) {
        return data[0][key];
    }

    return defaultValue;
}

async function addOrUpdateJsonArray(table, primaryKey, data) {
    data = JSON.stringify(data).replace(/\"/g, "\\\"")
                               .replace(/\'/g, "\\\'");

    await executeQuery(`INSERT INTO ${table} VALUES (${primaryKey},"${data}") ON DUPLICATE KEY UPDATE userId=${primaryKey},data=JSON_MERGE(data, "${data}")`);
}

module.exports = {
    init: init,
    executeQuery: executeQuery,
    findFirst: findFirst,
    addOrUpdateJsonArray: addOrUpdateJsonArray
}