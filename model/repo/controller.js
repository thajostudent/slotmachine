const Controller = require('../../lib/controller');
const repoFacade = require('./facade');
const jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.55:8080`, crumbIssuer: true, promisify: true });
const { getRepoName, isValidUrl, createJenkinsConfigFile } = require('../../lib/helpers/repo');


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


    try {
      // Create jenkins config.xml from repoUrl
      jenkinsConfigXML = await createJenkinsConfigFile({ scmUrl: repoUrl });
      // Create the job at the jenkins server
      await jenkins.job.create(repoName, jenkinsConfigXML);
      // Start the build
      await jenkins.job.build(repoName);
      // If all succesfull return to user
      return res.send({ text: `Repo ${repoName} was added` });
    }
    catch (e) {
      console.log('Error', e.message);
      if (e.message.includes('A job already exists with the name')) {
        return res.send({ text: `The repo ${repoName} was already added` });
      }
      else if (e.message.includes('job.create')) {
        return res.send({ text: `There was a problem starting the tests on ${repoName}` });
      }
      else {
        return next(e);
      }
    }
  }
}


module.exports = new RepoController(repoFacade);
