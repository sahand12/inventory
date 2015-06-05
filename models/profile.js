/**
 * Created by MH on 6/6/2015.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var profileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "user" },
    age: Number,
    birthday: Date,
    department: String,
    position: String,
    sex: String,
    marriageStatus: String
});

module.exports = exports = mongoose.model('Profile', profileSchema);