const jwt = require("jsonwebtoken");
const {config} = require("../config/secret")

exports.authToken = async (req, res, next) => {
    let token = req.header("x-api-key");
    if (!token) {
        return res.status(401).json({ msg: "You must sent token" });
    }
    try {
        let decodeToken = jwt.verify(token, config.tokenSecret);
        req.tokenData = decodeToken;
        // אם הכל בסדר נעבור לפונקציה הבאה
        next();
    }
    catch (err) {
        console.log();
        res.status(401).json({ msg: "token invalid or expired" });
    }
}


exports.authAdmin = (req, res, next) => {
    let token = req.header("x-api-key");
    if(!token) {
        return res.status(401).json({msg:"You need to send token to this endpoint"})
    }

    try {
        let decodeToken = jwt.verify(token, config.tokenSecret);

        if(decodeToken.role != "admin") {
            return res.status(401).json({msg:"Token invalid or expired, code: 3"});
        }

        req.tokenData = decodeToken;

        next();
    } catch(err) {
        console.log(err);
        return res.status(401).json({msg: "Token or expired, log in again or you hacker"})
    }
}