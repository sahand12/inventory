/**
 * Created by hamid on 6/15/15.
 */
'use strict';

exports = module.exports = function (app, mongoose) {

    var vendorSchema = new mongoose.Schema({
        name: { type: String, unique: true },
        products: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'Good'
        }]
    });

    app.db.model('Vendor', vendorSchema);
};