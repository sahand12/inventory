// schema/Good.js
'use strict';

exports = module.exports = function (app, mongoose) {

    var goodSchema = new mongoose.Schema({
        companyProduced: { type: String },
        name: { type: String },
        type: { type: String },
        color: { type: String },
        size: { type: String },
        description: { type: String, default: "" },
        AdditionalProperties: [{ name: String, value: String }],
        category: [String],
        departmentBelongsTo: { type: String },
        quantity: { type: Number, default: 0 },
        assetNumber: { type: String, unique: true },
        search: [String],
        timeUpdated: { type: Date, default: Date.now },
        timeCreated: { type: Date, default: Date.now },
        history: [{
            quantity: Number,
            time: { type: Date, default: Date.now },
            added: Boolean,
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', name: String }
        }],
        shelf: { type: String }
    });

    app.db.model('Good', goodSchema);
};