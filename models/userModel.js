const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("../config/secret")

const userSchema = new mongoose.Schema({
    full_name: {
        first_name: String,
        last_name: String
    },
    email: String,
    password: String,
    date_created: {
        type: Date, default: Date.now()
    },
    role: {
        type: String, default: "user"
    }
})

exports.UserModel = mongoose.model("users", userSchema);

exports.createToken = (_userId) => {
    let token = jwt.sign({ _id: _userId }, config.tokenSecret, { expiresIn: "60mins" });
    return token;
}

exports.userValid = (_bodyValid) => {
    let joiSchema = Joi.object({
        full_name: Joi.object({
            first_name: Joi.string().min(2).max(50).required(),
            last_name: Joi.string().min(2).max(50).required()
        }).required(),
        email: Joi.string().min(2).max(100).email().required(),
        password: Joi.string().min(6).max(50).required()
    })
    return joiSchema.validate(_bodyValid);
}

exports.loginValid = (_bodyValid) => {
    let joiSchema = Joi.object({
        email: Joi.string().min(2).max(100).email().required(),
        password: Joi.string().min(6).max(50).required()
    })
    return joiSchema.validate(_bodyValid);
}