
function MyPromise(func) {
    this.status = "pending";
    this.value = undefined;
    this.successCB = [];
    this.errorCB = undefined;
    this.finallyCB = undefined;

    this.then = function (cb) {
        this.successCB.push(cb);
        return this;
    }

    this.catch = function (cb) {
        this.errorCB = cb;
        return this;
    }

    this.finally = function (cb) {
        this.finallyCB = cb;
        return this;
    }

    function waiter(index) {
        if(index == this.successCB.length) {
            if (this.finallyCB) this.finallyCB(this.value);
            return;
        }
        var that = this;
        if(this.value.constructor == MyPromise) {
            this.value.then(x => {
                that.value = that.successCB[index](x) || x;
                waiter.call(that, ++index);
            }).catch(x => {
                if(that.errorCB) that.errorCB(x);
                if (that.finallyCB) that.finallyCB(x);
                return;
            })
        } else {
            this.value = this.successCB[index](this.value) || this.value;
            waiter.call(that, ++index);
        }
    }

    function resolve(value) {
        this.status = "success";
        this.value = value;
        waiter.call(this, 0);
    }

    function reject(value) {
        this.status = "failure";
        this.value = value;
        this.errorCB(value);
        if (this.finallyCB) this.finallyCB(this.value);
    }

    func(resolve.bind(this), reject.bind(this));
}


x = new MyPromise(function (resolve, reject) {
    setTimeout(() => resolve(50), 5000);
})
y = function(val) {
        return new MyPromise(function (resolve, reject) {
        setTimeout(() => resolve(val*10), 1000);
    })
}
x.then(v => 2 * v).then(v => y(v)).then(v => y(v)).then(console.log).finally(x => console.log('Yayy !', x));