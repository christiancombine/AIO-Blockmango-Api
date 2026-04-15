module.exports = class DressOptions {
    constructor(options) {
        this.categoryId = options.categoryId;
        this.sex = options.sex;
        this.currency = options.currency;
        this.hideClanDresses = options.hideClanDresses;
        this.hideFreeDresses = options.hideFreeDresses;
        this.ownerFilter = options.ownerFilter;
        this.ownerType = options.ownerType;
        this.usingFilter = options.usingFilter;
    }

    // Owner Types
    // 1 - STRICT: Strictly filters dresses from the ownerFilter array (No other dresses will be filtered regardless of the options)
    // 2 - TAG_ITEM: Tags dresses from the ownerFilter array with the 'hasPurchases' property set to 1

    setCategoryId(categoryId) {
        this.categoryId = categoryId;
    }

    getCategoryId() {
        return this.categoryId;
    }

    setSex(sex) {
        this.sex = sex;
    }

    getSex() {
        return this.sex;
    }

    setCurrency(currency) {
        this.currency = currency;
    }

    getCurrency() {
        return this.currency;
    }

    setHideClanDresses(hideClanDresses) {
        this.hideClanDresses = hideClanDresses;
    }

    getHideClanDresses() {
        return this.hideClanDresses;
    }

    setHideFreeDresses(hideFreeDresses) {
        this.hideFreeDresses = hideFreeDresses;
    }

    getHideFreeDresses() {
        return this.hideFreeDresses;
    }

    setOwnerFilter(ownerFilter) {
        this.ownerFilter = ownerFilter;
    }

    getOwnerFilter() {
        return this.ownerFilter;
    }

    setUsingFilter(usingFilter) {
        this.usingFilter = usingFilter;
    }

    getUsingFilter() {
        return this.usingFilter;
    }
}