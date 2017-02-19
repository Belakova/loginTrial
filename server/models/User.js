var mongoose = require('mongoose');

var timestamp = require('mongoose-timestamp');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isValid: {
        type: Boolean,
        required: true,
        default: false
    },
    activationToken: {
      type: String
    }
});

UserSchema.plugin(timestamp);
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(isMatch);
    });
};

module.exports = UserSchema;
