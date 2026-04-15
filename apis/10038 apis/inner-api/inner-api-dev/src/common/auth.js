const crypto = require("crypto");
const authConfig = require("@config/auth");

function verify(signature, nonce, timestamp) {
    if (Date.now() > timestamp + authConfig.expireTime) {
        return false;
    }

    const computedSignature = crypto.createHash("sha1")
                                    .update(`${authConfig.innerSecretKey}${nonce}${timestamp}`)
                                    .digest("hex");

    if (signature.length != computedSignature.length) {
        return false;
    }

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
}

module.exports = {
    verify: verify
}