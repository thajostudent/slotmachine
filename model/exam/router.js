const controller = require('./controller');
const Router = require('express').Router;
const router = new Router();

router.route('/')
  .get((...args) => controller.find(...args))
<<<<<<< HEAD
=======
  // .post((...args) => controller.registerExam(...args));
  .post((...args) => controller.createExam(...args));

router.route('/save')
  .post((...args) => controller.saveExam(...args));
>>>>>>> f6a7425a677c0a3fb2479d78e361e2c8d2aac7be

router.route('/book')
  .post((...args) => controller.bookExam(...args));
  
router.route('/create')
  .post((...args) => controller.registerExam(...args));


router.route('/:id')
  .put((...args) => controller.update(...args))
  .get((...args) => controller.findById(...args))
  .delete((...args) => controller.remove(...args));

module.exports = router;
