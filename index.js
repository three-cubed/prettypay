const express = require('express');
const app = express();
const prettypayRouter = app.use('/prettypay', require('./routes/routes'));

module.exports = prettypayRouter;
