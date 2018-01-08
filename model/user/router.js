const controller = require('./controller');
const Router = require('express').Router;
const router = new Router();

router.route('/')
  .post((...args) => controller.create(...args));

  router.route('/exams')
    .post((...args) => controller.getExams(...args));

module.exports = router;
