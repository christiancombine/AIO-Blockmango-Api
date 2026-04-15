const auth = require("@common/auth");
const responses = require("@common/responses");

function innerAuthentication(request) {
    const signature = request.headers["signature"];
    const nonce = parseInt(request.headers["nonce"]);
    const timestamp = parseInt(request.headers["timestamp"]);
    
    if (!signature || !nonce || !timestamp) {
        return { hasSucceeded: false, response: responses.notFound() };
    }
    
    const isValid = auth.verify(signature, nonce, timestamp);
    
    if (!isValid) {
        return { hasSucceeded: false, response: responses.notFound() };
    }

    return { hasSucceeded: true };
}

module.exports = {
    innerAuthentication: innerAuthentication
}