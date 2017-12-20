const Controller = require('../../lib/controller');
const repoFacade = require('./facade');
const fs = require('fs');
const axios = require('axios')
var jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.55:8080`, crumbIssuer: true, promisify: true });
const xml2js = require('xml2js');

class RepoController extends Controller {
  addRepo(req, res, next) {

    const file = fs.readFileSync('./lib/test/config.xml', { encoding: 'utf-8' });
    const repo = req.body.text
    
    var parts = repo.split('/');
    var userAndExam = parts.pop();


    function XMLStringToObject(string) {
      return new Promise((resolve, reject) => {
        xml2js.parseString(string, (err, result) => {
          if (err) reject(err);

          return resolve(result);
        });
      });
    }

    XMLStringToObject(file).then((doc) => {
      doc.project.properties[0]['com.coravy.hudson.plugins.github.GithubProjectProperty'][0].projectUrl[0] = repo
      doc.project.scm[0].userRemoteConfigs[0]['hudson.plugins.git.UserRemoteConfig'][0].url[0] = repo

      var builder = new xml2js.Builder();
      var xml = builder.buildObject(doc);

      jenkins.job.create(userAndExam, xml)
        .then((r) => jenkins.job.build(userAndExam))
        .catch(e => console.log(e))
    })
  }
}

module.exports = new RepoController(repoFacade);
