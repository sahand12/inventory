/**
 * Created by MH on 5/13/2015.
 */

function ContentHandler() {

    // GET     /
    this.displayHomePage = function (req, res, next) {
        var vm = {
            title: "Well Service Company",
            googleFonts: false
        };
        return res.render('website/home', vm);
    };

    // GET    /products
    this.displayProductsPage = function (req, res, next) {
        var vm = {
            title: "Products",
            productsPage: true
        };
        res.render('website/products', vm);
    };

    // GET    /products/coiled-tubing
    this.displayCoiledPage = function (req, res, next) {
        var vm = {
            title: "Coiled Tubing",
            productsPage: true
        };
        return res.render('website/coiledPage', vm);
    };

    // GET    /products/well-test
    this.displayWellTestPage = function (req, res, next) {
        var vm = {
            title: "Well Testing",
            productsPage: true
        };
        return res.render('website/wellTestPage', vm);
    };

    // GET     /products/well-stimulation
    this.displayWellStimulationPage = function (req, res, next) {
        var vm = {
            title: "Well Stimulation",
            productsPage: true
        };
        return res.render('website/wellStimulationPage', vm);
    };

    // GET    /products/drilling-fluid
    this.displayDrillingFluidPage = function (req, res, next) {
        var vm = {
            title: "Drilling Fluid Solutions",
            productsPage: true
        };
        return res.render('website/drillingFluidPage');
    };

    this.displayDomainsPage = function (req, res, next) {
        var vm = {
            title: "domains page",
            googleFonts: true
        };
        res.render('content/domains', vm);
    };

    this.displayChallengesPage = function (req, res, next) {
        var vm = {
            title: 'challenges'
        };
        res.render('content/challenges', vm);
    };

    this.displayAboutPage = function (req, res, next) {
        var vm = {
            title: 'About Us',
            aboutPage: true
        };
        res.render('website/about', vm);
    };
}


module.exports = ContentHandler;