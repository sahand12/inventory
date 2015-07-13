'use strict';

module.exports = exports = function QueryTimePlugin (schema, options) {

    schema.pre('find', function () {
        this.start = Date.now();
    });

    schema.post('find', function () {
        console.log('Query time: ', Date.now() - this.start, "ms");
    })
};