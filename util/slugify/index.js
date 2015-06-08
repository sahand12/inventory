// util/slugify/index.js
'use strict';

exports = module.exports = function (string) {
    return string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};