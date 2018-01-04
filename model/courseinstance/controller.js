const Controller = require('../../lib/controller');
const courseinstanceFacade = require('./facade');

class CourseinstanceController extends Controller {}

module.exports = new CourseinstanceController(courseinstanceFacade);
