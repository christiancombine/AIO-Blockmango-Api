module.exports = class Page {
    constructor(data, totalSize, pageNo, pageSize) {
        this.pageNo = Number(pageNo);
        this.pageSize = Number(pageSize);
        this.totalSize = Number(totalSize);

        if (this.totalSize % pageSize == 0) {
            this.totalPage = (this.totalSize / this.pageSize);
        } else {        
            this.totalPage = Math.floor(this.totalSize / this.pageSize + 1);
        }
        
        if (isNaN(this.totalPage)) {
            this.totalPage = 0;
        }
    
        const startIndex = Page.getStartIndex(this.pageNo, this.pageSize);
        if (data.length == totalSize) {
            this.data = data.filter((val, i) => i >= startIndex && i < startIndex + this.pageSize);
        } else {
            this.data = data;
        }
    }

    static getStartIndex(pageNo, pageSize) {
        return pageNo * pageSize;   
    }

    static empty() {
        return new Page([], 0, 0, 0);
    }

    setPageNum(pageNo) {
        this.pageNo = pageNo;
    }

    getPageNum() {
        return this.pageNo;
    }

    setPageSize(pageSize) {
        this.PageSize = pageSize;
    }

    getPageSize() {
        return this.pageSize;
    }

    setTotalSize(totalSize) {
        this.totalSize = totalSize;
    }

    getTotalSize() {
        return this.totalSize;
    }

    setData(data) {
        this.data = data;
    }

    getData() {
        return this.data;
    }
}