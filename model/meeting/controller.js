const Controller = require('../../lib/controller');
const meetingFacade = require('./facade');

class MeetingController extends Controller {

}

module.exports = new MeetingController(meetingFacade);
