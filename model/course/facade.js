const Facade = require('../../lib/facade');
const courseSchema = require('./schema');

class CourseFacade extends Facade {}

module.exports = new CourseFacade('Course', courseSchema);
