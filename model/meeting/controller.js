const Controller = require('../../lib/controller');
const meetingFacade = require('./facade');
//const jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.55:8080`, crumbIssuer: true, promisify: true });
var jenkinsapi = require('jenkins-api');
var jenkins = jenkinsapi.init(`http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.55:8080`);
const { getJob } = require('../../lib/helpers/repo');

class MeetingController extends Controller {

    apiTest(req, res, next) {
        //{ url: 'http://194.47.174.55:8080/job/co000ol-exam1/1/' }
        var obj = getJob(req.body.url)
        //console.log(obj.name + obj.number)
        jenkins.test_result(obj.name, obj.number, function(err, data) {
            console.log(data);
        });

    }
}

module.exports = new MeetingController(meetingFacade);
