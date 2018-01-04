const Controller = require('../../lib/controller');
const userFacade = require('./facade');

class UserController extends Controller {
  // Just testing
  create(req, res, next) {
    res.send(req.body).status(200);
  }
  
  
}

module.exports = new UserController(userFacade);
