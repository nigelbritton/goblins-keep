const path = require("path");
const express = require("express");
const routes = express.Router();

const { generateUser, createProfile, getProfiles } = require("../lib/keeper-user");
const { getActions } = require("../lib/keeper-actions");
const { getQueue, addActionToQueue, completeActionInQueue } = require("../lib/keeper-queue");
const { getObjects, importObjects } = require("../lib/keeper-objects");
const { verifyIdToken } = require("../lib/keeper-auth");

const tokenValidator = async function (req, res, next) {
    let idToken = null;
    let decodedToken = null;
    let isValidRequest = true;
    let isValidToken = true;

    res.locals.contentMethod = req.headers["content-type"];

    if (req.path !== '/status') {
        idToken = req.headers["token"];
        res.locals.decodedToken = decodedToken = await verifyIdToken(idToken);

        if (res.locals.contentMethod !== 'application/json') { isValidRequest = false; }
        if (!decodedToken) { isValidToken = false; }
    }

    if (isValidToken === false) {
        res.status(401).send({
            version: process.env.npm_package_version,
            status: 'ERROR',
            message: 'Session Expired',
            updated: new Date().getTime(),
        });
    } else if (isValidRequest === false) {
        res.status(405).send({
            version: process.env.npm_package_version,
            status: 'ERROR',
            message: 'Invalid content type',
            updated: new Date().getTime(),
        });
    } else {
        next();
    }
}

routes.use(tokenValidator);

routes.get("/status", async function (req, res) {
    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'OK',
        updated: new Date().getTime(),
    };

    res.send(payloadInfo);
});


routes.get("/user", async function (req, res) {
    const decodedToken = res.locals.decodedToken;

    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'ERROR',
        updated: new Date().getTime(),
    };

    if (decodedToken) {
        payloadInfo.status = 'OK';
        payloadInfo.data = await getProfiles(decodedToken.uid);
    }

    res.send(payloadInfo);
});

routes.post("/user", async function (req, res) {
    const decodedToken = res.locals.decodedToken;

    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'ERROR',
        updated: new Date().getTime(),
    };

    if (decodedToken) {
        payloadInfo.status = 'OK';
        payloadInfo.data = await createProfile(decodedToken.uid);
    }

    res.send(payloadInfo);
});


routes.get("/users", async function (req, res) {
    const decodedToken = res.locals.decodedToken;

    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'ERROR',
        updated: new Date().getTime(),
    };

    if (decodedToken) {
        payloadInfo.status = 'OK';
        payloadInfo.data = await getProfiles(decodedToken.uid);
    }

    res.send(payloadInfo);
});


routes.get("/objects", async function (req, res) {
    const decodedToken = res.locals.decodedToken;

    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'ERROR',
        updated: new Date().getTime(),
    };

    if (decodedToken) {
        payloadInfo.status = 'OK';
        payloadInfo.data = await getObjects(false);
    }

    res.send(payloadInfo);
});

routes.post("/objects", async function (req, res) {
    const decodedToken = res.locals.decodedToken;
    const decodedBody = req.body;

    const parsedBody = Object.assign({ group: '' }, decodedBody);

    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'ERROR',
        updated: new Date().getTime(),
    };

    if (decodedToken) {
        payloadInfo.status = 'OK';
        if (parsedBody.group === '') {
            payloadInfo.data = await getObjects(false);
        } else {
            payloadInfo.data = await getObjects({ field: 'group', compare: '==', value: parsedBody.group });
        }
    }

    res.send(payloadInfo);
});

routes.get("/queue", async function (req, res) {
    const decodedToken = res.locals.decodedToken;

    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'ERROR',
        updated: new Date().getTime(),
    };

    if (decodedToken) {
        payloadInfo.status = 'OK';
        payloadInfo.data = await getQueue({ field: 'userId', compare: '==', value: decodedToken.uid });
    }

    res.send(payloadInfo);
});

routes.post("/queue", async function (req, res) {
    const decodedToken = res.locals.decodedToken;
    const decodedBody = req.body;

    let isValidParams = true;
    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'ERROR',
        updated: new Date().getTime(),
    };

    const parsedBody = Object.assign({ profileId: '', actionId: '', objectId: '' }, decodedBody);

    if (isValidParams) {
        payloadInfo.status = 'OK';
        payloadInfo.data = await addActionToQueue({ uid: decodedToken.uid, profileId: parsedBody.profileId, actionId: parsedBody.actionId, objectId: parsedBody.objectId });
    }

    res.send(payloadInfo);
});

routes.post("/queue/:queueId", async function (req, res) {
    const decodedToken = res.locals.decodedToken;
    const decodedBody = req.body;
    const decodedParams = req.params;

    let isValidParams = true;
    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'ERROR',
        updated: new Date().getTime(),
    };

    const parsedBody = Object.assign({ profileId: '', queueId: '' }, decodedBody, { queueId: decodedParams.queueId });

    if (!decodedParams) { isValidParams = false; payloadInfo.message = 'Invalid params'; }

    if (isValidParams) {
        payloadInfo.status = 'OK';
        payloadInfo.data = await completeActionInQueue({ uid: decodedToken.uid, profileId: parsedBody.profileId, queueId: parsedBody.queueId });
        if (payloadInfo.data === false) {
            payloadInfo.status = 'ERROR';
            payloadInfo.message = 'Invalid queue item';
            delete payloadInfo.data;
        }
    }

    res.send(payloadInfo);
});

routes.get("/actions", async function (req, res) {
    const decodedToken = res.locals.decodedToken;

    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'OK',
        updated: new Date().getTime(),
    };

    if (decodedToken) {
        payloadInfo.status = 'OK';
        payloadInfo.data = await getActions(false);
    }

    res.send(payloadInfo);
});

routes.get("/quests", async function (req, res) {
    const decodedToken = res.locals.decodedToken;

    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'OK',
        updated: new Date().getTime(),
    };

    res.send(payloadInfo);
});

routes.get("/quests/:typeId", async function (req, res) {
    const decodedToken = res.locals.decodedToken;
    const decodedParams = req.params;

    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'OK',
        updated: new Date().getTime(),
    };

    res.send(payloadInfo);
});


routes.post("/action/:actionId", async function (req, res) {
    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'OK',
        updated: new Date().getTime(),
    };

    res.send(payloadInfo);
});


routes.post("/import", async function (req, res) {
    let payloadInfo = {
        version: process.env.npm_package_version,
        status: 'OK',
        updated: new Date().getTime(),
    };

    // await importObjects();

    res.send(payloadInfo);
});

module.exports = routes;
