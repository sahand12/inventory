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

    profile: {
        birthday: { type: Date },
        image: { type: String },

    },
    role: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }

    // generate a salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.verifyPassword = function (password, done) {
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