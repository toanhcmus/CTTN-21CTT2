const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    fullName: String,
    type: String,
    admin: {
        type: Boolean,
        default: false,
    }
    },
    {timestamps: true}
);

const User = new mongoose.model("User", userSchema);

module.exports = User;