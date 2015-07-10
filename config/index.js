// config/index.js
'use strict';

exports.port = process.env.NODE_PORT || 3000;
exports.mongodb = {
    uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URI || 'mongodb://localhost:27017/basicAuth'
};
exports.companyName = 'Climax Well Services';
exports.projectName = "Inventory Management";
exports.systemEmail = "climaxws@gmail.com";
exports.cryptoKey = "k3yb0ardc4t";
exports.loginAttempts = {
    forIp: 50,
    forIpAndUser: 7,
    logExpiration: '20m'
};
exports.requireAccountVerfication = false;
exports.smtp = {
    from: {
        name: process.env.SMTP_FROM_NAME || exports.projectName + ' Website',
        address: process.env.SMTP_FROM_ADDRESS
    },
    credentials: {
        user: process.env.SMTP_USERNAME,
        password: process.env.SMTP_PASSWORD,
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        ssl: true
    }
};
exports.authorization = {
    errors: {
        message: "You don't have permission to access this page"
    }
};
exports.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//exports.monthsLength = [31, 28 || 29, ]
exports.charts = {
    line: {
        fillColor : "rgb(180, 209, 205)",
        strokeColor : "#fff",
        pointColor : "rgb(55, 160, 141)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(220,220,220,1)"
    }
};
exports.getDaysInMonths = function (year) {
    var daysInMonth = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var isLeap = isLeapYear(year);
    if (isLeap) {
        daysInMonth[1] = 29;
    }
    else {
        daysInMonth[1] = 28;
    }
    return daysInMonth;
};

function isLeapYear (year) {
    return ( ( (year % 4 === 0) && (!year % 100 === 0)) || (year % 400 === 0) );
}