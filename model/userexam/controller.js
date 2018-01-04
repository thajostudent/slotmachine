const Controller = require('../../lib/controller');
const userexamFacade = require('./facade');

class UserexamController extends Controller {}

module.exports = new UserexamController(userexamFacade);
