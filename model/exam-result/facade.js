const Facade = require('../../lib/facade');
const examResultSchema = require('./schema');

class ExamResultFacade extends Facade {}

module.exports = new ExamResultFacade('ExamResult', examResultSchema);
