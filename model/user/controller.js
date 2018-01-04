const Controller = require('../../lib/controller');
const userFacade = require('./facade');

class UserController extends Controller {
  
  create(req, res, next) {
    
    console.log(req.body.text);
    const users = req.body.text.split(" ")
    console.log(users);
    
    users.map()
    
    res.send(req.body).status(200);
  }
  
  
}

module.exports = new UserController(userFacade);
