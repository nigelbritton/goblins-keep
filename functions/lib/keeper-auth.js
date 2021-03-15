const admin = require('firebase-admin');

/**
 *
 * @param {string} idToken
 */
module.exports.verifyIdToken = async function (idToken) {
    let decodedToken = null;

    if (typeof (idToken) !== 'string') { return decodedToken; }

    try {
        decodedToken = await admin
            .auth()
            .verifyIdToken(idToken);
    } catch (err) {
        // handle error
        // console.log(err);
    }

    return decodedToken;
}
