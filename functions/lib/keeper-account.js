const { createAccount, getAccountById, getAccountByEmail } = require("./keeper-database");

/**
 *
 * @param {string} email
 * @returns
 */
module.exports.createAccount = async function (email) {
    return await createAccount(email);
};

/**
 *
 * @param {string} objectId
 * @returns
 */
module.exports.getAccountById = async function (objectId) {
    return await getAccountById(objectId);
};

/**
 *
 * @param {string} email
 * @returns
 */
module.exports.getAccountByEmail = async function (email) {
    return await getAccountByEmail(email);
};
