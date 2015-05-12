var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    id: String,
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String
});

userSchema.methods.verifyPassword = function (password) {
    console.log( bcrypt.hashSync('ali', 10), "\n", this.password);
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);