/**
 * Created by MH on 5/13/2015.
 */

// The contentHandler must be constructed with a connected db
function ContentHandler() {


    this.displayHomePage = function (req, res, next) {
        var vm = {
            title: "home page"
        };

        res.render('content/home', vm);
    };


    this.displayProductsPage = function (req, res, next) {
        var vm = {
            title: "products page"
        };

        res.render('content/products', vm);
    };


    this.displayDomainsPage = function (req, res, next) {
        var vm = {
            title: "domains page",
            googlefonts: true
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
            title: 'about us'
        };

        res.render('content/about', vm);
    };
}


module.exports = ContentHandler;