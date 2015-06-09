var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    compression = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    expressHandlebars = require('express-handlebars'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    flash = require('connect-flash'),
    http = require('http'),
    csurf = require('csurf'),
    helmet = require('helmet'),
    passport = require('passport');

// my own modules
var config = require('./config'),
    ErrorHandler = require('./controllers/errorHandler'),
    errorHandler = new ErrorHandler();

// create express app
var app = express();

// keep reference to config
app.config = config;

// setup the server
app.server = http.createServer(app);

// setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, "mongoose connection error"));
app.db.once('open', function () {
    // and... we have a data store
});

// config data models
require('./models')(app, mongoose);

// create 'ExpressHandlebars' instance with a default layout and a partial directory
var hbs = expressHandlebars.create({
    defaultLayout: 'main',
    partialDir: 'views/partials'
});

// register 'hbs' as our view engine using its bound 'engine' function
app.engine('handlebars', hbs.engine);

// settings
app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// middleware
app.use(logger('dev'));
app.use(compression());
app.use(express.static( path.join(__dirname, 'public') ));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser(config.cryptoKey));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.cryptoKey,
    store: new MongoStore({ url: config.mongodb.uri })
}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(csurf({ cookie: { signed: true } }));
helmet(app);

// response locals
app.use(function (req, res, next) {
    //res.cookie('_csrf', req.csrfToken());
    //res.locals.csrfToken = req.csrfToken();
    res.locals.user = {};
    res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
    res.locals.user.username = req.user && req.user.username;
    next();
});

// global locals
app.locals.projectName = app.config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.cacheBreaker = 'br34k-01';

// setup passport
require('./passport')(app, passport);

// setup routes
require('./routes')(app, passport);

// custom friendly error handler
app.use(errorHandler.http500);

// setup utilities
app.utility = {};
app.utility.sendMail = require('./util/sendmail');
app.utility.slugify = require('./util/slugify');
app.utility.workflow = require('./util/workflow');

// listen up
app.server.listen(config.port, function () {
    // and... we're live
    console.log('Server is running on port ' + config.port);
});