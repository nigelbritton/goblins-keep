const { getQueue, addActionToQueue, completeActionInQueue } = require("./keeper-database");

/**
 * @param {null|object} filter
 *
 * @returns promise
 */
module.exports.getQueue = async function (filter) {
    return await getQueue(filter);
};

/**
 * @param {object} queue
 * @param {string} queue.uid
 * @param {string} queue.profileId
 * @param {string} queue.actionId
 * @param {string} queue.objectId
 *
 * @returns promise
 */
module.exports.addActionToQueue = async function (queue) {
    return await addActionToQueue(queue);
};

/**
 * @param {object} queue
 * @param {string} queue.uid
 * @param {string} queue.queueId
 * @param {string} queue.profileId
 *
 * @returns promise
 */
module.exports.completeActionInQueue = async function (queue) {
    return await completeActionInQueue(queue);
};

