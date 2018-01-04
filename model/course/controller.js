const Controller = require('../../lib/controller');
const courseFacade = require('./facade');

class CourseController extends Controller {}

module.exports = new CourseController(courseFacade);
