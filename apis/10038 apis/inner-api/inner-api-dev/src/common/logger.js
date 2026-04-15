function log(color, type, message) {
    console.log(color, `${new Date().toLocaleString()} [${type.toUpperCase()}] ${message}`);
}

function debug(value) {
    log("\x1b[92m%s\x1b[0m", "debug", value);
}

function info(value) {
    log("\x1b[94m%s\x1b[0m", "info", value);
}

function warn(value) {
    log("\x1b[93m%s\x1b[0m", "warn", value);
}

function error(value) {
    log("\x1b[91m%s\x1b[0m", "error", value);
    if (typeof(value) == "object") {
        log("", "STACKTRACE", value.stack);
    }
}

function fatal(value) {
    log("\x1b[31m%s\x1b[0m", "fatal", value);
    if (typeof(value) == "object") {
        log("", "STACKTRACE", value.stack);
    }
}

module.exports = {
    debug: debug,
    info:  info,
    warn:  warn,
    error: error,
    fatal: fatal
}