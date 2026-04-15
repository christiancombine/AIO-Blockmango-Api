require("module-alias/register");

const app = require("express")();
require("./router")(app);

const mariadb = require("@common/mariadb");

mariadb.init();

const logger = require("@common/logger");
const config = require("@config/host");

app.listen(config.apiPort, () => {
    logger.info(`INNER(TM) API server started PORT=${config.apiPort}`);
});