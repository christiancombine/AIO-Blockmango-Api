const responses = require("@common/responses");
const AccountBinding = require("@models/AccountBinding");

async function getDiscordBindingStatus(connectId) {
    if (!connectId) {
        return responses.missingConnectId();
    }

    const accountBinding = await AccountBinding.fromConnectId(connectId);
    return responses.success(accountBinding.response());
}

module.exports = {
    getDiscordBindingStatus: getDiscordBindingStatus
}