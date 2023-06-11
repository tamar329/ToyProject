const express = require("express");
const bcrypt = require("bcryptjs");
const { UserModel, userValid, loginValid, createToken } = require("../models/userModel");
const { authToken, authAdmin } = require("../middleware/auth");
const router = express.Router();

router.get("/", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 20) || 4;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await UserModel
            .find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
        res.json(data);
    }
    catch (err) {

        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.get("/userInfo", authToken, async (req, res) => {
    let user = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(user);
    // res.json("all good we after the auth middleware")
})

router.post("/", async (req, res) => {
    let valdiateBody = userValid(req.body);
    if (valdiateBody.error) {
        return res.status(400).json(valdiateBody.error.details)
    }
    try {
        let user = new UserModel(req.body);
        user.password = await bcrypt.hash(user.password, 10)
        await user.save(); 
        user.password = "******";
        res.status(201).json(user)
    }
    catch (err) {
        if (err.code == 11000) {
            return res.status(400).json({ msg: "Email already in system try login", code: 11000 })
        }
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.post("/login", async (req, res) => {
    let valdiateBody = loginValid(req.body);
    if (valdiateBody.error) {
        return res.status(400).json(valdiateBody.error.details)
    }
    try {
        let user = await UserModel.findOne({ email: req.body.email })
        if (!user) {
            return res.status(401).json({ msg: "User and password not match" })
        }
        let validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).json({ msg: "User and password not match" })
        }
        let newToken = createToken(user._id);
        res.json({ token: newToken });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.delete("/:delId", async (req, res) => {
    try {
        const id = req.params.delId;
        let data = await UserModel.deleteOne({ _id: id });
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err });
    }
});

router.put("/:idEdit", async (req, res) => {
    try {
        const id = req.params.delEdit;
        let data = await UserModel.put({ _id: id });
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err });
    }
});

module.exports = router;