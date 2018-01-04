const Controller = require('../../lib/controller');
const userFacade = require('./facade');

class UserController extends Controller {
  
  create(req, res, next) {
    
    //console.log(req.body);
    const users = req.body.text.split(" ")
    const channel = req.body.channel_name.split("-")[0]
    console.log(users);
    console.log(channel);
    
    const promises = users.map((user)=>{
      userFacade.create({username:user})
    })
    
    Promise.all(promises).then(() =>{
      res.send(req.body).status(200);
    })
  } 
}

module.exports = new UserController(userFacade);
