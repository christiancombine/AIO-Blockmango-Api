const util = require("node:util");
const redis = require("redis");
const dbConfig = require("@config/database");
const logger = require("@common/logger");

var client = null;

function init() {
    client = redis.createClient(dbConfig["redis"]);
    
    client.on("error", (err) => {
        logger.error("An error occurred while using Redis");
        logger.error(err);
    });

    client.connect();
}

function instance() {
    if (!client) {
        throw Error("Redis is not initialized");
    }

    return client;
}

async function getKey(format, ...params) {
    if (!client) {
        throw Error("Redis is not initialized");
    }

    const key = util.format(format, ...params);
    
    var value = await client.get(key);
    if (value && !isNaN(value)) {
        value = parseInt(value);
    }

    return value;
}

async function setKey(format, data, expireDate) {
    if (!client) {
        throw Error("Redis is not initialized");
    }

    const key = util.format(format.key, ...format.params);
    await client.set(key, data);
    if (expireDate && expireDate > 0) {
        await client.expire(key, expireDate)
    }
}

module.exports = {
    init: init,
    instance: instance,
    getKey: getKey,
    setKey: setKey
}