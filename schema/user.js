/**
 * Created by hamid on 6/8/15.
 */
var bcrypt = require('bcrypt');

exports = module.exports = function (app, mongoose) {

    var userSchema = new mongoose.Schema({
        email: { type: String, unique: true, lowercase: true },
        password: String,
        employeeId: { type: String, unique: true },
        role: String,
        name: {
            first: { type: String, default: '' },
            last: { type: String, default: '' }
        },

        profile: {
            birthday: { type: Date, default: '' },
            img: { type: String, default: "" },
            homeAddress: {
                city: { type: String, default: '' },
                country: { type: String, default: '' },
                address: { type: String, default: '' },
                tel: [{ type: String, default: '' }]
            },
            cellphone: [{ type: String, default: '' }],
            maritalStatus: { type: String, default: '' },
            nationalCode: { type: String, default: '' },
            birthCertificateNumber: { type: String, default: '' },
            fatherName: { type: String, default: '' }
        },

        work: {
            hireDate: { type: Date, default: Date.now() },
            title: { type: String, default: '' },
            department: { type: String, default: '' },
            location: {
                city: { type: String, default: '' },
                address: { type: String, default: '' },
                tel: { type: String, default: '' }
            }
        },
        timeCreated: { type: Date, default: Date.now() },
        timeUpdated: { type: Date, default: Date.now() },
        search: [String],

        resetPasswordToken: String,
        resetPasswordExpires: Date
    });

    userSchema.statics.encryptPassword = function (password, done) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return done(err);
            }
            bcrypt.hash(password, salt, function (err, hash) {
                done(err, hash);
            });
        });
    };

    userSchema.statics.validatePassword = function(password, hash, done) {
        return bcrypt.compare(password, hash, function (err, isValid) {
            if (err) { return done(err, null); }
            return done(null, isValid);
        });
    };

    userSchema.pre('save', function (next) {
        var user = this;

        // set the timeUpdated
        user.timeUpdated = Date.now();

        // only hash the password if it has been modified ( or is new )
        if (!user.isModified('password')) return next();

        // generate salt
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

    userSchema.methods.canPlayRoleOf = function (role) {
        return this.role === role;
    };

    userSchema.methods.defaultReturnUrl = function () {
        var returnUrl = '/sim/';
        if (this.canPlayRoleOf('engineer')) returnUrl = "/sim/engineer/";
        if (this.canPlayRoleOf('manager')) returnUrl = "/sim/manager/";
        if (this.canPlayRoleOf('supervisor')) returnUrl = "/sim/supervisor/";
        if (this.canPlayRoleOf('owner')) returnUrl = "/sim/owner/";
        return '/sim/dashboard/';
    };

    userSchema.index({ email: 1 }, { unique: true });
    userSchema.index({ employeeId: 1 }, { unique: true });
    userSchema.index({ search: 1 });
    userSchema.index({ timeCreated: 1 });
    userSchema.set('autoIndex', (app.get('env') === "development"));

    app.db.model('User', userSchema);
    return mongoose.model('User', userSchema);
};