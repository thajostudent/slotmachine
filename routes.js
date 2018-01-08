const Router = require('express').Router;
const router = new Router();

const exam = require('./model/exam/router');
const user = require('./model/user/router');
const meeting = require('./model/meeting/router');
const repo = require('./model/repo/router');
const interactivecomp = require('./model/interactivecomp/router');
const course = require('./model/course/router');

const checkSlackToken = require('./lib/middleware/checkSlackToken');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to slotmachine API!' });
});

router.use('/exams', checkSlackToken, exam);
router.use('/users', checkSlackToken, user);
router.use('/meetings', checkSlackToken, meeting);
router.use('/repos', repo);
router.use('/interactivecomp', checkSlackToken, interactivecomp);
router.use('/courses', checkSlackToken, course);

module.exports = router;
