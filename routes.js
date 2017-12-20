const Router = require('express').Router;
const router = new Router();

const exam = require('./model/exam/router');
const user = require('./model/user/router');
const meeting = require('./model/meeting/router');
const repo = require('./model/repo/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to slotmachine API!' });
});

router.use('/exam', exam);
router.use('/user', user);
router.use('/meeting', meeting);
router.use('/repo', repo);

module.exports = router;
