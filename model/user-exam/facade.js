const Facade = require('../../lib/facade');
const userExamSchema = require('./schema');

class UserExamFacade extends Facade {}

module.exports = new UserExamFacade('UserExam', userExamSchema);
