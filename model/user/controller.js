const Controller = require('../../lib/controller');
const userFacade = require('./facade');
const axios = require('axios')

class UserController extends Controller {
  
  create(req, res, next) {
    
    axios.post('https://slack.com/api/users.info', {
    user: 'U82EX0SP2',
    token: process.env.SLOT
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
    // https://slack.com/api/users.info
    // user
    // token
    
    //console.log(req.body);
    const users = req.body.text.split(" ")
    const channel = req.body.channel_name.split("-")[0]
    console.log(users);
    console.log(channel);
    
    const promises = users.map((user)=>{
      userFacade.create({username:channel + "/" + user})
    })
    
    Promise.all(promises).then(() =>{
      res.send(req.body).status(200);
    })
  } 
}


module.exports = new UserController(userFacade);
