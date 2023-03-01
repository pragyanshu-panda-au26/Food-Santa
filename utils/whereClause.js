// base-  Product.find()

const { json } = require("express");

// api/v1/product?search=coder&page=2&catoegory=shortsleves&rating[gte]=4
// &price[lte]=999&price[gte]=199

//rating:{$gte:'4'}



class WhereClause {
    constructor(base, BigQ) {
        this.base = base;
        this.BigQ = BigQ;
    }
    search() {
        const searchWord = this.BigQ.search ? {
            name: {
                $regex: this.BigQ.search,
                $options: 'i'
            },
        } : {};
        this.base = this.base.find({...searchWord })
        return this;
    }

    filter() {
        const copyQ = {...this.BigQ };
        delete copyQ['search'];
        delete copyQ['limit'];
        delete copyQ['page'];

        // convert bigq to str
        let strofCopyQ = JSON.stringify(copyQ)

        strofCopyQ = strofCopyQ.replace(/\b(gte|lte)\b/g, m => `$${m}`)

        let jsonofCopy = JSON.parse(strofCopyQ)

        this.base = this.base.find(jsonofCopy)
        return this
    }



    pager(resultperPage) {
        let currentPage = 1
        if (this.BigQ.page) {
            currentPage = this.BigQ.page
        }
        const skipVal = resultperPage * (currentPage - 1)
        this.base = this.base.limit(resultperPage).skip(skipVal)
        return this;
    }
}


module.exports = WhereClause;