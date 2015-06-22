// config/index.js
'use strict';

exports.port = process.env.port || 3000;
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
        address: process.env.SMTP_FROM_ADDRESS || 'climaxws@gmail.com'
    },
    credentials: {
        user: process.env.SMTP_USERNAME || 'climaxws@gmail.com',
        password: process.env.SMTP_PASSWORD || '004917631177805',
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        ssl: true
    }
};
exports.authorization = {
    errors: {
        message: "You don't have permission to access this page"
    }
};
exports.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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