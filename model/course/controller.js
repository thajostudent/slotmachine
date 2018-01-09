const Controller = require('../../lib/controller');
const courseFacade = require('./facade');

class CourseController extends Controller {
  async create(req, res, next) {
    // Check if course channel and pick of course name
    // Check if admin
    try {
      await courseFacade.create({ title: req.body.channel_name, channelid: req.body.channel_id });
      return res.send({
        text: 'Course created'
      });
    } catch (e) {
      return res.send({
        text: 'The course couldn\'t be created'
      });
    }
  }
}

module.exports = new CourseController(courseFacade);
