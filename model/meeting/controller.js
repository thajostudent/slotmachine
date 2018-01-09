const Controller = require('../../lib/controller');
const meetingFacade = require('./facade');
/* const userFacade = require('../user/facade');
const courseFacade = require('../course/facade');
var Jenkinsapi = require('jenkins-api');
var jenkinsapi = Jenkinsapi.init(`http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.62:8080`);
const jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.62:8080`, crumbIssuer: true, promisify: true });
const {
  getJob,
  createJenkinsConfigFile,
  getTestCases,
  getSlackUserId,
  postMessageToSlackUser
} = require('../../lib/helpers/repo');

const getSemester = require('../../lib/tools').getSemester;
const examFacade = require('../exam/facade'); */

class MeetingController extends Controller {

}

module.exports = new MeetingController(meetingFacade);
