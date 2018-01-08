const controller = require('./controller');
const Router = require('express').Router;
const router = new Router();

router.route('/')
  .post((...args) => controller.addRepo(...args));

router.route('/hooks')
  .post((...args) => controller.hooks(...args));

module.exports = router;
