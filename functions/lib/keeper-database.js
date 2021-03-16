const firebase = require('firebase');
const admin = require('firebase-admin');
const { getExperienceLevelGrowth } = require('./keeper-settings');

const database = require('../db-full.json');

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();


/**
 * @return promise
 */
module.exports.importObjects = async function () {
    const batch = db.batch();

    database.objects.forEach((doc) => {
        let document = Object.assign({}, doc);
        delete document.id;
        let docRef = db.collection("objects").doc();
        batch.set(docRef, document);
    });

    await batch.commit();

    return true;
}

/**
 * @return promise
 */
module.exports.importActions = async function () {
    const batch = db.batch();

    database.objects.forEach((doc) => {
        let document = Object.assign({}, doc);
        delete document.id;
        let docRef = db.collection("actions").doc();
        batch.set(docRef, document);
    });

    await batch.commit();

    return true;
}


/**
 * @param {string} id
 * @param {string} collection
 *
 * @return promise
 */
const getCollectionDataById = async function (id, collection) {
    if (!id) { return null; }

    const doc = await db.collection(collection).doc(id).get();

    if (!doc.exists) {
        return null;
    } else {
        return Object.assign(doc.data(), { id: doc.id });
    }
}

/**
 *
 * @param {object} document
 * @returns
 */
const checkActionQueueComplete = function (document) {
    let durationDateStamp = new Date();

    if (new Date(document.durationRemaining._seconds * 1000) < durationDateStamp) {
        document.completed = true;
        document.durationSecondsRemaining = 0;
    } else {
        document.completed = false;
        document.durationSecondsRemaining = Math.floor(((document.durationRemaining._seconds * 1000) - durationDateStamp.getTime()) / 1000);
    }

    return document.completed;
}

/**
 *
 * @param {number} skillLevel
 * @param {number} objectLevel
 * @returns
 */
const getRewardRandomizer = function (skillLevel, objectLevel) {
    var rewardBaseValue = 25;
    var rewardMaxValue = 90;
    var rewardSeed = Math.floor((Math.random() * 100) + 1);
    var rewardCalculation = (((skillLevel - objectLevel) * 10) + rewardBaseValue);
    rewardCalculation = (rewardCalculation >= rewardMaxValue ? rewardMaxValue : rewardCalculation);
    return (rewardCalculation > rewardSeed);
}

/**
 *
 * @param {object} rewardObject
 * @param {object} rewardObject.userId
 * @param {object} rewardObject.profileId
 * @param {object} rewardObject.objectId
 * @param {object} rewardObject.name
 * @param {object} rewardObject.quantity
 * @param {object} rewardObject.group
 * @param {object} rewardObject.experience
 */
const updateProfileWithGatheringReward = async function (rewardObject) {
    let updatedInventory = null;
    const profileDocument = await getCollectionDataById(rewardObject.profileId, 'profiles');
    const profileRef = db.collection('profiles').doc(rewardObject.profileId);
    // console.log('updateProfileWithGatheringReward', profileDocument);

    const resultIndex = profileDocument.inventory.findIndex(inventoryItem => inventoryItem.objectId === rewardObject.objectId);
    // console.log('updateProfileWithGatheringReward', resultIndex);

    if (resultIndex === -1) {
        updatedInventory = profileDocument.inventory.concat({
            objectId: rewardObject.objectId,
            name: rewardObject.name,
            quantity: rewardObject.quantity,
        });
    } else {
        profileDocument.inventory[resultIndex].quantity += rewardObject.quantity;
        updatedInventory = profileDocument.inventory;
    }

    const updatedProfile = {
        inventory: updatedInventory,
        skills: {}
    };
    updatedProfile.skills[rewardObject.group] = {
        level: profileDocument.skills[rewardObject.group].level,
        experience: profileDocument.skills[rewardObject.group].experience + rewardObject.experience
    }
    const experienceGrowth = getExperienceLevelGrowth(updatedProfile.skills[rewardObject.group].level, updatedProfile.skills[rewardObject.group].experience);
    if (experienceGrowth !== false) {
        updatedProfile.skills[rewardObject.group].level = experienceGrowth.level;
        updatedProfile.skills[rewardObject.group].experience = experienceGrowth.experience;
    }
    // console.log('updateProfileWithGatheringReward', experienceGrowth);
    // console.log('updateProfileWithGatheringReward', updatedProfile);

    const res = await profileRef.set(updatedProfile, { merge: true });
}

/**
 *
 * @param {string} objectId
 * @param {number} skillLevel
 * @returns
 */
const getGatheringRewardById = async function (objectId, skillLevel) {
    var objectsArray = [];
    var objectDetail = await getCollectionDataById(objectId, 'objects');
    var objectRewardCount = 0;
    var objectExperience = 0;
    var objectExperienceTotal = 0;
    var objectRewardLimit = 5;

    if (objectDetail && objectDetail.rare && objectDetail.rare === true) { objectRewardLimit = 2; }

    // console.log('getGatheringRewardById', objectDetail);

    for (var i = 0; i < objectRewardLimit; i++) {
        if (true === getRewardRandomizer(skillLevel, objectDetail.levelRequired)) {
            objectExperience = (objectDetail.levelRequired * Math.floor((Math.random() * 25) + 25)) - (((skillLevel - objectDetail.levelRequired) + 1) * 5);
            if (objectExperience < 0) { objectExperience = 0; }
            if (objectDetail && objectDetail.rare && objectDetail.rare === true) { objectExperience = objectExperience * 2; }
            objectRewardCount++;
        }
        objectExperienceTotal += objectExperience;
    }

    return {
        objectId: objectDetail.id,
        name: objectDetail.name,
        quantity: objectRewardCount,
        group: objectDetail.group.toLowerCase(),
        experience: objectExperienceTotal
    };
}

/**
 * @param {string} collection
 * @param {object} query
 * @param {string} query.field
 * @param {string} query.compare
 * @param {string} query.value
 *
 * @return promise
 */
const queryCollectionData = async function (collection, query) {
    let snapshot = null;
    if (!query) {
        snapshot = await db.collection(collection)
            .get();
    } else {
        snapshot = await db.collection(collection)
            .where(query.field, query.compare, query.value)
            .get();

    }

    return snapshot;
}


/**
 * @param {null|object} filter
 *
 * @return promise
 */
module.exports.getQueue = async function (filter) {
    let actionList = [];
    const snapshot = await queryCollectionData('queue', filter);

    let durationDateStamp = new Date();

    if (snapshot.empty) {
        return [];
    }

    snapshot.forEach(doc => {
        let document = Object.assign(doc.data(), { id: doc.id });
        document = checkActionQueueComplete(document);
        actionList.push(document);
    });

    return actionList;
}

/**
 * @param {object} queue
 * @param {string} queue.uid
 * @param {string} queue.profileId
 * @param {string} queue.actionId
 * @param {string} queue.objectId
 *
 * @return promise
 */
module.exports.addActionToQueue = async function (queue) {
    const profileDocument = await getCollectionDataById(queue.profileId, 'profiles');
    const actionDocument = await getCollectionDataById(queue.actionId, 'actions');
    const objectDocument = await getCollectionDataById(queue.objectId, 'objects');

    console.log('addActionToQueue', queue);
    console.log('addActionToQueue', profileDocument);
    console.log('addActionToQueue', actionDocument);
    console.log('addActionToQueue', objectDocument);
    // return false;

    if (!actionDocument || !objectDocument || !profileDocument) {
        return false;
    }

    // check to see if the user owns this profile
    if (profileDocument.userId !== queue.uid) {
        return false;
    }

    let durationDateStamp = new Date();
    durationDateStamp.setSeconds(durationDateStamp.getSeconds() + actionDocument.duration);

    let queueUserObject = {
        userId: queue.uid,
        profileId: profileDocument.id,
        actionId: actionDocument.id,
        objectId: objectDocument.id,
        name: objectDocument.name,
        duration: actionDocument.duration,
        durationRemaining: admin.firestore.Timestamp.fromDate(durationDateStamp),
    };

    const doc = await db.collection('queue').add(queueUserObject);

    return Object.assign(queueUserObject, { id: doc.id });
}

/**
 * @param {object} queue
 * @param {string} queue.uid
 * @param {string} queue.queueId
 * @param {string} queue.profileId
 *
 * @return promise
 */
module.exports.completeActionInQueue = async function (queue) {
    const queueDocument = await getCollectionDataById(queue.queueId, 'queue');
    const profileDocument = await getCollectionDataById(queue.profileId, 'profiles');

    // console.log('completeActionInQueue', queue);
    // console.log('completeActionInQueue', queueDocument);
    // console.log('completeActionInQueue', profileDocument);
    // console.log('completeActionInQueue', actionDocument);
    // console.log('completeActionInQueue', objectDocument);
    // return false;

    if (!queueDocument || !profileDocument) {
        return false;
    }

    // check to see if the user owns this profile
    if (profileDocument.userId !== queue.uid) {
        return false;
    }

    if (!checkActionQueueComplete(queueDocument)) {
        return false;
    }

    const objectDocument = await getCollectionDataById(queueDocument.objectId, 'objects');
    if (!objectDocument) {
        return false;
    }

    let rewardObject = {
        userId: queue.uid,
        profileId: profileDocument.id,
    };
    const objectGroup = objectDocument.group.toLowerCase();
    const completionReward = await getGatheringRewardById(queueDocument.objectId, profileDocument.skills[objectGroup].level);
    // console.log('completeActionInQueue', completionReward);

    rewardObject = Object.assign({}, rewardObject, completionReward);

    if (rewardObject.quantity > 0) {
        await updateProfileWithGatheringReward(rewardObject);
    }

    const doc = await db.collection('queue').doc(queueDocument.id).delete();

    return rewardObject;
}


/**
 * @param {string} id
 *
 * @return promise
 */
module.exports.getActionById = async function (id) {
    return getCollectionDataById(id, 'actions');
}

/**
 * @param {null|object} filter
 *
 * @return promise
 */
module.exports.getActions = async function (filter) {
    let actionList = [];
    const snapshot = await queryCollectionData('actions', filter);

    if (snapshot.empty) {
        return [];
    }

    snapshot.forEach(doc => {
        actionList.push(Object.assign({}, doc.data()));
    });

    return actionList;
}


/**
 * @param {string} id
 *
 * @return promise
 */
module.exports.getObjectById = async function (id) {
    return getCollectionDataById(id, 'objects');
}

/**
 * @param {object} filter
 * @param {string} filter.field
 * @param {string} filter.compare
 * @param {string} filter.value
 *
 * @return promise
 */
module.exports.getObjects = async function (filter) {
    let objectList = [];
    const snapshot = await queryCollectionData('objects', filter);

    if (snapshot.empty) {
        return [];
    }

    snapshot.forEach(doc => {
        objectList.push(Object.assign({ id: doc.id }, doc.data()));
    });

    return objectList;
}


/**
 * @param {string} userId
 *
 * @return promise
 */
module.exports.getProfiles = async function (userId) {
    let profileList = [];
    const snapshot = await queryCollectionData('profiles', { field: 'userId', compare: '==', value: userId });

    if (snapshot.empty) {
        return [];
    }

    snapshot.forEach(doc => {
        profileList.push(Object.assign({}, doc.data()));
    });

    return profileList;
}

/**
 *
 * @param {string} id Firebase collection id.
 *
 * @return object|null
 */
module.exports.getProfileById = async function (id) {
    return getCollectionDataById(id, 'profiles');
}

/**
 *
 * @param {object} profileData
 */
module.exports.createProfile = async function (profileData) {
    const doc = await db.collection('profiles').add(profileData);

    return doc.id;
}

/**
 *
 * @param {string} id
 * @param {object} profileData
 * @param {object} options
 */
module.exports.updateProfile = async function (id, profileData, options) {
    if (typeof (id) !== 'string') { return null; }

    const documentOptions = Object.assign({ merge: true }, options);
    const doc = await db.collection('profiles').doc(id).set(profileData, documentOptions);

    return doc.id;
}

/**
 *
 * @param {string} id
 */
module.exports.deleteProfileById = async function (id) {
    return await db.collection('profiles').doc(id).delete();
}
