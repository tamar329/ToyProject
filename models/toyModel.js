const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");

const toySchema = new mongoose.Schema({
    name: String,
    info: String,
    category: String,
    img_url: String,
    price: Number,
    date_created: {
        type: Date, default: Date.now()
    },
    userId: String
})

exports.ToyModel = mongoose.model("toys", toySchema);

exports.toyValid = (_bodyValid) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        info: Joi.string().min(2).max(1000).required(),
        category: Joi.string().min(2).max(50).required(),
        img_url: Joi.string().min(2).max(2000).required(),
        price: Joi.number().min(2).max(500).required()
    })
    return joiSchema.validate(_bodyValid);
}