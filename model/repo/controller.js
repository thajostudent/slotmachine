const Controller = require('../../lib/controller');
const repoFacade = require('./facade');
const { getOrgAndRepo, isValidUrl } = require('../../lib/helpers/repo');
const { setGitHook } = require('../../lib/gitApiUtils');


class RepoController extends Controller {
  async addRepo(req, res, next) {
    const repoUrl = req.body.text;

    if (!isValidUrl(repoUrl)) {
      return res.send({
        text: `Please add a repo url formated in the following way: 
                https://github.com/0dv000/xx00xx-exam-1`
      });
    }

    // Picking of need parts of Url for hook
    const orgAndRepo = getOrgAndRepo(repoUrl);
    console.log(orgAndRepo);
    // Setting the webhook on github
    try {
      await setGitHook(orgAndRepo, process.env.GITHUB_TOKEN, "fredriko83", "https://coinflippers-fredriko83.c9users.io/meetings", ["release"]);
      return res.send({
        text: `${repoUrl} succesfully added`
      });
    }
    catch (e) {
      console.log(e);
      if(e.message.includes("already exists")){
        return res.send({
        text: `${repoUrl} has already been added`
      });
      }
      return res.send({
        text: `There was a problem adding ${repoUrl} sorry about that!`
      });
      
    }
  }
}

module.exports = new RepoController(repoFacade);
