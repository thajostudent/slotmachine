const Controller = require('../../lib/controller');
const userFacade = require('./facade');

class UserController extends Controller {
  
  create(req, res, next) {
    
    console.log(req.body.text);
    createUserArray()
    
    res.send(req.body).status(200);
  }
  
  
}

module.exports = new UserController(userFacade);
