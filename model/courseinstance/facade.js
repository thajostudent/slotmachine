const Facade = require('../../lib/facade');
const courseinstanceSchema = require('./schema');

class CourseinstanceFacade extends Facade {}

module.exports = new CourseinstanceFacade('Courseinstance', courseinstanceSchema);
