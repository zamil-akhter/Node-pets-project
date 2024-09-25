const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName:String,
    email: String,
    phoneNumber : Number,
    gender : {
        type : String,
        enum : ['male', 'female', 'other'],
        default: null
    },
    password : String,
},{timestamps:true});

const User = mongoose.model('User', userSchema);
module.exports = User;