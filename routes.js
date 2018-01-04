const Router = require('express').Router;
const router = new Router();

const exam = require('./model/exam/router');
const user = require('./model/user/router');
const meeting = require('./model/meeting/router');
const repo = require('./model/repo/router');
const interactivecomp = require('./model/interactivecomp/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to slotmachine API!' });
});

router.use('/exams', exam);
router.use('/users', user);
router.use('/meetings', meeting);
router.use('/repos', repo);
router.use('/interactivecomp', interactivecomp)

module.exports = router;
