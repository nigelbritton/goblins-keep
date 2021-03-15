const { getObjects, importObjects } = require("./keeper-database");

module.exports.importObjects = async function () {
    return await importObjects();
};

module.exports.getObjectById = async function (objectId) {
    return await getObjectById(objectId);
};

/**
 *
 * @param {null|object} filter
 * @returns
 */
module.exports.getObjects = async function (filter) {
    return await getObjects(filter);
};
