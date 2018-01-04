const Controller = require('../../lib/controller');
const repoFacade = require('./facade');
const jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.62:8080`, crumbIssuer: true, promisify: true });
const { getRepoName, isValidUrl, createJenkinsConfigFile } = require('../../lib/helpers/repo');
const { setGitHook } = require('../../lib/gitApiUtils');


class RepoController extends Controller {
  async addRepo(req, res, next) {
    const repoUrl = req.body.text;
    let jenkinsConfigXML;

    if (!isValidUrl(repoUrl)) {
      return res.send({
        text: `Please add a add repo url formated in the following way: 
                https://github.com/0dv000/xx00xx-exam-1`
      });
    }

    // Pick the name of the repo from repoUrl
    const repoName = getRepoName(repoUrl);


    //setGitHook(fullName, accessToken, userAgent, returnAddress, events)
    const resp = await setGitHook("0dv000/folep02-exam-1", process.env.GITHUB_TOKEN2, "fredriko83", "https://coinflippers-fredriko83.c9users.io/meetings", ["release"])  
    
    
  }
}

module.exports = new RepoController(repoFacade);

