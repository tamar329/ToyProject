const express = require("express");
const { authToken, authAdmin } = require("../middleware/auth");
const { ToyModel, toyValid } = require("../models/toyModel");
const router = express.Router();

router.get("/", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await ToyModel
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

router.get("/", authToken, async (req, res) => {
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await ToyModel
            .find({ userId: req.tokenData._id })
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


router.get("/search", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;


    try {
        let queryS = req.query.s;
        let searcgReg = new RegExp(queryS, "i");
        let data = await ToyModel
            .find({ name: searcgReg })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(data)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "There error try again later", err })
    }
})

router.get("/category/:catName", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;
    let catname = req.params.catName;

    try {
        let data = await ToyModel
            .find({ category: catname })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.get("/prices", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;
    let minPrice = req.query.min;
    let maxPrice = req.query.max;

    try {
        if (maxPrice && maxPrice) {
            let data = await ToyModel
                .find({ price: { $gte: minPrice, $lte: maxPrice } })
                .limit(perPage)
                .skip((page - 1) * perPage)
            res.json(data);
        }
        else if (maxPrice) {
            let data = await ToyModel
                .find({ price: { $lte: maxPrice } })
                .limit(perPage)
                .skip((page - 1) * perPage)
            res.json(data);
        }
        else if (minPrice) {
            let data = await ToyModel
                .find({ price: { $lte: minPrice } })
                .limit(perPage)
                .skip((page - 1) * perPage)
            res.json(data);
        }
        else {
            let data = await ToyModel
                .find({})
                .limit(perPage)
                .skip((page - 1) * perPage)
            res.json(data);
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.get("/single/:idSingle", async (req, res) => {
    let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;
    let idSingle = req.params.idSingle;

    try {
        let data = await ToyModel
            .findOne({ _id: idSingle })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})


router.post("/", authToken, async (req, res) => {
    let valdiateBody = toyValid(req.body);
    if (valdiateBody.error) {
        return res.status(400).json(valdiateBody.error.details)
    }
    try {
        let toy = new ToyModel(req.body);
        toy.userId = req.tokenData._id;
        await toy.save();
        res.status(201).json(toy)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.put("/:idEdit", authToken, async (req, res) => {
    let valdiateBody = toyValid(req.body);
    if (valdiateBody.error) {
        return res.status(400).json(valdiateBody.error.details)
    }
    try {
        let idEdit = req.params.idEdit;
        let data;
        if(req.tokenData.role == "admin") {
            data = await ToyModel.updateOne({ _id: idEdit }, req.body)
        } else {
            data = await ToyModel.updateOne({ _id: idEdit, userId:req.tokenData._id }, req.body)
        }
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.delete("/:idDel", authAdmin, async (req, res) => {
    try {
        let idDel = req.params.idDel;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ToyModel.deleteOne({ _id: idDel }, req.body)
        } else {
            data = await ToyModel.deleteOne({ _id: idDel, userId: req.tokenData._id }, req.body)
        }
        res.json(data);
    }
    catch (err) {
            console.log(err)
            res.status(500).json({ msg: "err", err })
        }
    })

module.exports = router;