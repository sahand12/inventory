/**
 * Created by hamid on 6/13/15.
 */
'use strict';

exports = module.exports = function (app, mongoose) {

    var goodEntry = new mongoose.Schema({
        goodType: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Good' },
        },
        partNumber: { type: String, unique: true },
        quantity: { type: Number },
        timeCreated: { type: Date, default: Date.now },

    })
}