var mongoose = require('mongoose');

var stampSchema = new mongoose.Schema({
    name: String,
    neighborhood: String,
    address: String,
    image: String,
    description: String,
    usersCompleted: Number,
    question: String,
    answer: String,
    reqStamp: Boolean,
    approved: Boolean,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

module.exports = mongoose.model("Stamp", stampSchema);