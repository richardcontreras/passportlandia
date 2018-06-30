var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
 
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    level: Number,
    nStamps: [String],
    nStampsDone: Boolean,
    neStamps: [String],
    neStampsDone: Boolean,
    nwStamps: [String],
    nwStampsDone: Boolean,
    seStamps: [String],
    seStampsDone: Boolean,
    swStamps: [String],
    swStampsDone: Boolean
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);