const mariadb = require("@common/mariadb");

async function getOwnedDresses(userId) {
    return await mariadb.findFirst(`SELECT data FROM dressing_owned WHERE userId=${userId}`, "data", []);
}

async function getEquippedDresses(userId) {
    return await mariadb.findFirst(`SELECT data FROM dressing_equipped WHERE userId=${userId}`, "data", []);
}

async function addDresses(userId, dresses) {
    const newData = JSON.stringify(dresses);
    await mariadb.executeQuery(`INSERT INTO dressing_owned VALUES (${userId},"${newData}") ON DUPLICATE KEY UPDATE userId=${userId},data=JSON_MERGE(data, "${newData}")`);
}

async function setEquippedDresses(userId, equippedDresses) {
    const data = JSON.stringify(equippedDresses);
    await mariadb.executeQuery(`INSERT INTO dressing_equipped VALUES (${userId},"${data}") ON DUPLICATE KEY UPDATE userId=${userId},data="${data}"`);
}

module.exports = {
    getOwnedDresses: getOwnedDresses,
    getEquippedDresses: getEquippedDresses,
    addDresses: addDresses,
    setEquippedDresses: setEquippedDresses
}