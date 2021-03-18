const functions = require("firebase-functions");
const jwt = require("jsonwebtoken");

module.exports.uuidv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
}

module.exports.validateToken = function (token) {
    let decodedToken = false;
    try {
        decodedToken = jwt.verify(token, functions.config().jwt.secret);
        return decodedToken;
    } catch (err) {
        return false;
    }
}

module.exports.issueToken = function (object) {
    return jwt.sign(
        object,
        functions.config().jwt.secret
    );;
}
