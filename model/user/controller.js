const axios = require('axios');
const Controller = require('../../lib/controller');
const userFacade = require('./facade');

class UserController extends Controller {
  async create(req, res, next) {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://slack.com/api/users.info',
        headers: {
          Authorization: `Bearer ${process.env.SLACK_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: `user=${req.body.user_id}`
      });

      console.log(response);

      if (!response.data.user.is_admin) {
        return res.send('Not authorized');
      }
    } catch (e) {
      console.log(e);
      return res.send('Sorry, something went wrong.');
    }

    // console.log(req.body);
    const users = req.body.text.split(' ');
    const channel = req.body.channel_name.split('-')[0];
    console.log(users);
    console.log(channel);

    const promises = users.map(user => (
      userFacade.create({ username: user })
    ));

    Promise.all(promises)
      .then(() => (
        res.send({
          text: 'Users added'
        })
      ))
      .catch((e) => {
        console.log(e);
        return res.send('Sorry, something went wrong');
      });
  }
}


module.exports = new UserController(userFacade);
