const Controller = require('../../lib/controller');
const repoFacade = require('./facade');

class RepoController extends Controller {
  addRepo(req, res, next) {
    console.log(req.body.text);
  }
}

module.exports = new RepoController(repoFacade);
