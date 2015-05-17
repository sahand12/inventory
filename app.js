var express           = require('express'),
    path              = require('path'),
    favicon           = require('serve-favicon'),
    logger            = require('morgan'),
    cookieParser      = require('cookie-parser'),
    bodyParser        = require('body-parser'),
    expressHandlebars = require('express-handlebars'),
    expressSession    = require('express-session'),
    mongoose          = require('mongoose'),
    flash             = require('connect-flash');
    passport          = require('passport');

var config       = require('./config'),
    initPassport = require('./passport/init');

var routes    = require('./routes/index'),
    simRoutes = require('./routes/sim')(passport);


var app = express();

/*
 * ---------------------------------------
 *            MONGOOSE
 * ---------------------------------------
 */
mongoose.connect(config.mongoUri);
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, "Mongoose: Error connecting to the database"));
connection.once('open', console.info.bind(console, "Mongoose: Connected to the `basicAuth` database."));


/**
 * -----------------------------------------
 *           VIEW ENGINE SETUP
 * -----------------------------------------
 */
app.set('views', path.join(__dirname, 'views'));

// Create 'ExpressHandlebars' instance with a default layout
var hbs = expressHandlebars.create({
    defaultLayout: 'main',

    partialDir: 'views/partials'
});

// Register 'hbs' as our view engine using its bound 'engine()' function
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


/**
 * -----------------------------------------
 *           DEFAULT MIDDLEWARES
 * -----------------------------------------
 */
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


/**
 * -----------------------------------------
 *        CONFIGURE PASSPORT
 * -----------------------------------------
 */
app.use(expressSession({
  secret: 'fortune favors the bold',
  saveUninitialized: false,
  resave: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store
// messages in the session and displaying in templates
app.use(flash());

// Initialize passport
initPassport(passport);

/**
 * -----------------------------------------
 *                   ROUTES
 * -----------------------------------------
 */
app.use('/', routes);
app.use('/sim', simRoutes);


/**
 * -----------------------------------------
 *             ERROR HANDLING
 * -----------------------------------------
 */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
