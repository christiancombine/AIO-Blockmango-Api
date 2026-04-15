const User = require("@models/User");
const Vip = require("@models/Vip");

async function addVip(userId, vipLevel, days) {
    const dateObject = new Date();
    dateObject.setDate(days);
    
    const expireDate = "YYYY-MM-DD".replace("YYYY", dateObject.getFullYear())
                                   .replace("MM", dateObject.getMonth() + 1) // Zero-based
                                   .replace("DD", dateObject.getDate());

    const vip = await Vip.fromUserId(userId);
    vip.setLevel(vipLevel);
    // vip.setExpireDate(expireDate);
    vip.setExpireDate(Date.now());
    await vip.save();
}

module.exports = {
    addVip: addVip
}