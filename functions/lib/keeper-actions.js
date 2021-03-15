const { getActions } = require("./keeper-database");

/**
 *
 * @param {null|object} filter
 * @returns
 */
module.exports.getActions = async function (filter) {
    return await getActions(filter);
};
