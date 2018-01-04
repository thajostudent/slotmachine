const Facade = require('../../lib/facade');
const userexamSchema = require('./schema');

class UserexamFacade extends Facade {}

module.exports = new UserexamFacade('Userexam', userexamSchema);
