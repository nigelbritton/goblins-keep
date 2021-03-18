const { getLocationByUserId } = require("./keeper-database");

module.exports.getLocationByUserId = async function () {
    return await getLocationByUserId();
};
