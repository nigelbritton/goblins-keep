const { getObjects, importObjects } = require("./keeper-database");

module.exports.importObjects = async function () {
    return await importObjects();
};

module.exports.getObjectById = async function (objectId) {
    return await getObjectById(objectId);
};

/**
 *
 * @param {object} filter
 * @param {string} filter.field
 * @param {string} filter.compare
 * @param {string} filter.value
 * @returns
 */
module.exports.getObjects = async function (filter) {
    return await getObjects(filter);
};
