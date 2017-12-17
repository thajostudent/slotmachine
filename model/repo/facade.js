const Facade = require('../../lib/facade');
const repoSchema = require('./schema');

class RepoFacade extends Facade {}

module.exports = new RepoFacade('Repo', repoSchema);
