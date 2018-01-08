const Controller = require('../../lib/controller');
const repoFacade = require('./facade');
const userFacade = require('../user/facade');
const courseFacade = require('../course/facade');
const examFacade = require('../exam/facade');

const Jenkinsapi = require('jenkins-api');
const jenkinsapi = Jenkinsapi.init(`http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@${process.env.JENKINS_URL}`);
const jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@${process.env.JENKINS_URL}`, crumbIssuer: true, promisify: true });

const { getJob, createJenkinsConfigFile, getTestCases, getSlackUserId, postMessageToSlackUser } = require('../../lib/helpers/repo');
const { getOrgAndRepo, isValidUrl } = require('../../lib/helpers/repo');
const { setGitHook } = require('../../lib/gitApiUtils');
const { getSemester } = require('../../lib/tools');


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

      await setGitHook(orgAndRepo, process.env.GITHUB_TOKEN, "slackapi", process.env.GITHUB_WEBHOOK_RES_URL, ["release"]);

      return res.send({
        text: `${repoUrl} succesfully added`
      });
    }
    catch (e) {
      console.log(e);
      if (e.message.includes("already exists")) {
        return res.send({
          text: `${repoUrl} has already been added`
        });
      }
      return res.send({
        text: `There was a problem adding ${repoUrl} sorry about that!`
      });
    }
  }

  async hooks(req, res, next) {
    // Setting up jenkins job on webhook creation
    if (req.body.hook) {
      res.sendStatus(200);
      console.log("Setting up job on jenkins");
      try {
        const jenkinsConfigXML = await createJenkinsConfigFile({ scmUrl: "https://github.com/" + req.body.repository.full_name });

        await jenkins.job.create(req.body.repository.full_name.replace("/", "_"), jenkinsConfigXML);
      }
      catch (e) {
        console.log(e.message);
      }
    }
    // Starting buildjob on webhook release event
    else if (req.body.action === "published" && req.body.release.target_commitish === "master") {
      console.log("Starting buildjob");
      res.sendStatus(200);
      try {
        await jenkins.job.build(req.body.repository.full_name.replace("/", "_"));
      }
      catch (e) {
        console.log(e.message);
      }

    }
    // Receives tests results data and sends a message to the student if they passed
    else if (req.body.url) {
      // Break up to jenkins job url into useable chunks
      const jobObj = getJob(req.body.url);
      // Get the test results from the jenkins server
      jenkinsapi.test_result(jobObj.org + "_" + jobObj.name, jobObj.number, async function(err, data) {
        if (err) { console.log(err.message) }
        if (data.failCount === 0) {
          try {
            const user = await userFacade.findOne({ username: jobObj.user });
            const course = await courseFacade.findOne({ title: jobObj.org });
            const exam = await examFacade.findOne({ course: jobObj.org + getSemester(), name: jobObj.exam });
            await examFacade.update({ _id: exam._id }, { $push: { results: user } });
            
            // get user id from user name
            const memberId = await getSlackUserId(jobObj.user);
            // post message to user that they can book an exam
            postMessageToSlackUser(memberId, course.channelid, `<@${memberId}>\n You tests have gone trough and you are now able to book an exam`);
          }
          catch (e) { console.log(e.message); }
        }
        else {
          try {
            const course = await courseFacade.findOne({ title: jobObj.org });
            const memberId = await getSlackUserId(jobObj.user);
            //return all failed testcases in string
            
            const fails = getTestCases(data);

            postMessageToSlackUser(memberId, course.channelid, `<@${memberId}>\n *${data.failCount} tests failed, no cookie for you!* \n` + ` *Fix the following to be able to book an exam:*\n ${fails}`);
          }
          catch (e) {
            console.log(e.message);
          }
        }
      });
    }
  }
}

module.exports = new RepoController(repoFacade);
