class features {
    constructor(Query,queryString) {
        this.Query = Query;
        this.queryString = queryString;
    }

    filter() {
        const queries = {...this.queryString};
        const excluded = ['page','sort','limit', 'fields'];
        excluded.forEach(el => delete queries[el]);
        // const tours = await Tour.find(req.query);
        let queryString = JSON.stringify(queries);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, ele => `$${ele}`);
        const queryFinal = JSON.parse(queryString);
        this.Query = this.Query.find(queryFinal);
        return this;
    }

    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.Query = this.Query.sort(sortBy);
        }
        else {
            this.Query = this.Query.sort('-createdAt');
        }
        return this;
    }

    select() {
        if(this.queryString.fields) {
            const selectFields = this.queryString.fields.split(',').join(' ');
            this.Query = this.Query.select(selectFields);
        }
        else {
            this.Query = this.Query.select('-__v');
        }
        return this;
    }

    pagination() {
        const page = this.queryString.page*1||1;
        const limit = this.queryString.limit*1||100;
        const skip = (page-1)*limit;
        this.Query = this.Query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = features;