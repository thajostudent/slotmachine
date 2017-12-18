const Facade = require('../../lib/facade');
const meetingSchema = require('./schema');

class MeetingFacade extends Facade {}

module.exports = new MeetingFacade('Meeting', meetingSchema);
