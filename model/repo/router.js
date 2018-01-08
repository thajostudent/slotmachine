const controller = require('./controller');
const Router = require('express').Router;
const router = new Router();

const checkSlackToken = require('../../lib/middleware/checkSlackToken');

router.route('/')
  .post(checkSlackToken, (...args) => controller.addRepo(...args));

router.route('/hooks')
  .post((...args) => controller.hooks(...args));

module.exports = router;
