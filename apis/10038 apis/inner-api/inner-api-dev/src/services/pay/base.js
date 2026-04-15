const crypto = require("crypto");
const constants = require("@common/constants");
const Transaction = require("@models/Transaction");
const Wealth = require("@models/Wealth");
const TransactionTypes = require("@constants/TransactionTypes");
const TransactionResults = require("@constants/TransactionResults");

async function addCurrency(userId, currencyType, amount, type) {
    if (amount == 0) {
        return  { hasFailed: false };
    }
    
    const userWealth = await Wealth.fromUserId(userId);
    const wealthType = constants.WEALTH_TYPES[currencyType];

    userWealth[wealthType] += amount;
    userWealth.save();

    const transaction = new Transaction({
        userId: userId,
        created: Date.now(),
        currency: currencyType,
        inoutType: TransactionTypes.ADDED,
        orderId: crypto.randomBytes(8).toString("hex"), // TODO: Rely on time for Transaction ID generation
        quantity: amount,
        status: TransactionResults.SUCCESS,
        transactionType: type
    });

    transaction.save();

    return { hasFailed: false, orderId: transaction.orderId, balance: userWealth };
}

async function hasEnoughCurrency(userId, currencyType, amount) {
    if (amount == 0) {
        return true;
    }

    const userWealth = await Wealth.fromUserId(userId);
    const wealthType = constants.WEALTH_TYPES[currencyType];

    return userWealth[wealthType] >= amount;
}

async function removeCurrency(userId, currencyType, amount, type) {
    if (amount == 0) {
        return { hasFailed: false };
    }

    const userWealth = await Wealth.fromUserId(userId);
    const wealthType = constants.WEALTH_TYPES[currencyType];

    amount = Math.floor(amount);
    let currentAmount = userWealth[wealthType];
    if (currentAmount - amount < 0) {
        currentAmount = 0;
    } else {
        currentAmount -= amount;
    }

    userWealth[wealthType] = currentAmount;
    userWealth.save();

    const transaction = new Transaction({
        userId: userId,
        created: Date.now(),
        currency: currencyType,
        inoutType: TransactionTypes.REMOVED,
        orderId: crypto.randomBytes(8).toString("hex"), // TODO: Rely on time for Transaction ID generation
        quantity: amount,
        status: TransactionResults.SUCCESS,
        transactionType: type
    });
    
    transaction.save();
    
    return { hasFailed: false, orderId: transaction.orderId, balance: userWealth };
}

module.exports = {
    addCurrency: addCurrency,
    hasEnoughCurrency: hasEnoughCurrency,
    removeCurrency: removeCurrency
}