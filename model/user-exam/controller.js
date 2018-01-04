const Controller = require('../../lib/controller');
const userExamFacade = require('./facade');

class UserExamController extends Controller {}

module.exports = new UserExamController(userExamFacade);
