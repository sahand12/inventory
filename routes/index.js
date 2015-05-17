// routes/index.js

var express = require('express'),
    router = express.Router();

var ContentHandler = require('../controllers/contentHandler');

var contentHandler = new ContentHandler();

router.get('/', contentHandler.displayHomePage);
router.get('/products', contentHandler.displayProductsPage);
router.get('/domains', contentHandler.displayDomainsPage);
router.get('/about', contentHandler.displayAboutPage);
router.get('/challenges', contentHandler.displayChallengesPage);

module.exports = router;