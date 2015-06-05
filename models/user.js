var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    //username: { type: String, unique: true },
    password: String,
    email: { type: String, unique: true },
    name: {
        first: { type: String, default: "" },
        last: { type: String, default: "" }
    },
    profile: { type: Schema.Types.ObjectId, ref: 'profile' },
    role: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.methods.verifyPassword = function (password, done) {
    console.log( bcrypt.hashSync('ali', 10), "\n", this.password);
    return bcrypt.compare(password, this.password, function (err, isEqual) {
        if (err){
            return done(err, null);
        }
        return done(null, isEqual);
    });
};

userSchema.statics.hashPassword = function (password) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    return hash;
};

module.exports = mongoose.model('User', userSchema);