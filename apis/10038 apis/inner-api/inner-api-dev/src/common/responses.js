function methodNotAllowed() {
    return {
        status: 400,
        content: {
            code: 400,
            message: "The method is not supported",
            data: null   
        }
    }
}

function notFound() {
    return {
        status: 404,
        content: {
            code: 404,
            message: "The endpoint is not found",
            data: null
        }
    }
}

function success(data) {
    return {
        status: 200,
        content: {
            code: 1,
            message: "SUCCESS",
            data: data ?? null
        }
    }
}

function innerError() {
    return {
        status: 500,
        content: {
            code: 4,
            message: "INNER ERROR",
            data: null
        }
    }
}

function userNotExists() {
    return {
        status: 200,
        content: {
            code: 102,
            message: "The user doesn't exist",
            data: null
        }
    }
}

function profileNotExists(data) {
    return {
        status: 200,
        content: {
            code: 1002,
            message: "The profile doesn't exist",
            data: data || null
        }
    }
}

function discordFailed() {
    return {
        status: 400,
        content: {
            code: 2,
            message: "Discord did not respond with 200 (OK)",
            data: null
        }
    }
}

function discordNotBound() {
    return {
        status: 200,
        content: {
            code: 9001,
            message: "You don't have a Discord account bound",
            data: null
        }
    }
}

function discordAlreadyBound() {
    return {
        status: 200,
        content: {
            code: 9002,
            message: "You already have a Discord account bound",
            data: null
        }
    }
}

function missingConnectId() {
    return {
        status: 400,
        content: {
            code: 3,
            message: "The connectId is missing"
        }
    }
}

module.exports = {
    methodNotAllowed: methodNotAllowed,
    notFound: notFound,
    success: success,
    innerError: innerError,
    userNotExists: userNotExists,
    profileNotExists: profileNotExists,
    discordFailed: discordFailed,
    discordNotBound: discordNotBound,
    discordAlreadyBound: discordAlreadyBound,
    missingConnectId: missingConnectId
}