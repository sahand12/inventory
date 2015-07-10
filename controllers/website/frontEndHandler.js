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


    /**
     * -------------------------------------
     *     DOMAINS PAGE AND SUB-PAGES
     * -------------------------------------
     */

    // GET     /domains
    this.showDomainsPage = function (req, res, next) {
        var vm = {
            title: "domains page",
            googleFonts: true,
            domainsPage: true
        };
        res.render('website/domains/domains', vm);
    };

    // GET /domains/aging-reservoirs
    this.showAgingPage = function (req, res, next) {
        var vm = {
            title: 'Aging Reservoirs',
            domainsPage: true
        };
        return res.render('website/domains/aging', vm);
    };

    // GET     /domains/unconventional
    this.showUnconventionalPage = function (req, res, next) {
        var vm = {
            title: "Unconventional",
            domainsPage: true
        };
        return res.render('website/domains/unconventional', vm);
    };

    // GET     /domains/deep-water
    this.showDeepWaterPage = function (req, res, next) {
        var vm = {
            title: "Deep Water",
            domainsPage: true
        };
        return res.render('website/domains/deepWater', vm);
    };

    /**
     * -----------------------------------------
     *      CHALLENGES PAGE AND SUB-PAGES
     * -----------------------------------------
     */
    // GET     /challenges
    this.displayChallengesPage = function (req, res, next) {
        var vm = {
            title: 'challenges',
            challengesPage: true
        };
        res.render('website/challenges/challenges', vm);
    };

    // GET     /challenges/well-placement
    this.displayWellPlacementPage = function (req, res, next) {
        var vm = {
            title: "Well Placement",
            challengesPage: true
        };
        return res.render('website/challenges/well-placement', vm);
    };

    // GET     /challenges/product-optimization
    this.displayProductionOptimizationPage = function (req, res, next) {
        var vm = {
            title: "Product Optimization",
            challengesPage: true
        };
        return res.render('website/challenges/production-optimization', vm);
    };

    // GET      /challenges/well-integrity
    this.displayWellIntegrityPage = function (req, res, next) {
        var vm = {
            title: "Well Integrity",
            challengesPage: true
        };
        return res.render('website/challenges/well-integrity', vm);
    };


    /**
     * -----------------------------------------
     *      ABOUT PAGES AND SUB-PAGES
     * -----------------------------------------
     */

    // GET     /about-us
    this.displayAboutPage = function (req, res, next) {
        var vm = {
            title: 'About Us',
            aboutPage: true
        };
        res.render('website/about/about', vm);
    };


    // GET     /about/safety
    this.displaySafetyPage = function (req, res, next) {
        var vm = {
            title: "Safety",
            aboutPage: true
        };
        return res.render('website/about/safety', vm);
    };

    // GET     /about/careers
    this.displayCareersPage =function (req, res, next) {
        var vm = {
            title: "Careers",
            aboutPage: true
        };
        return res.render('website/about/careers', vm);
    };

    // GET     /about/ethics
    this.displayEthicsPage = function (req, res, next) {
        var vm = {
            title: "Ethics and Compliance",
            aboutPage: true
        };
        return res.render('website/about/ethics', vm);
    };

    // GET     /about/corporate-responsibility
    this.displayResponsibilityPage = function (req, res, next) {
        var vm = {
            title: "Corporate Responsibility",
            aboutPage: true
        };
        return res.render('website/about/responsibility', vm);
    };


}


module.exports = ContentHandler;