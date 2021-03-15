const functions = require('firebase-functions');
const express = require("express");
const cors = require("cors");
const app = express();

const routes = require('./routes');

app.use(cors({ origin: true }));
app.use(express.json());

app.use(function (req, res, next) {
    res.removeHeader("x-powered-by");
    res.setHeader("X-Frame-Options", "deny");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
        "Cache-Control",
        "private, max-age=" + 3600 + ", must-revalidate"
    );
    next();
});

app.get('/', (req, res) => {
    res.json({
        version: process.env.npm_package_version,
        updated: new Date().getTime()
    });
});

app.use('/v1', routes);

routes.get('*', (req, res) => {
    res.status(404).json({
        version: process.env.npm_package_version,
        updated: new Date().getTime()
    });
});

/**
 *
 */
exports.app = functions.region('us-central1').https.onRequest(app);

