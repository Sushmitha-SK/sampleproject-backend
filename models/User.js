const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    resetPasswordToken: { type: String },  
    resetPasswordExpires: { type: Date }, 
});

module.exports = mongoose.model('User', userSchema);
