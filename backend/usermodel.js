const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String

}, {timestamps: true})


const userModel  = mongoose.model('user', userSchema);

module.exports = {
    userModel
}


