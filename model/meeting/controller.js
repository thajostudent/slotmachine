const Controller = require('../../lib/controller');
const meetingFacade = require('./facade');
//const jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.55:8080`, crumbIssuer: true, promisify: true });
var Jenkinsapi = require('jenkins-api');
var jenkinsapi = Jenkinsapi.init(`http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.62:8080`);
const jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.62:8080`, crumbIssuer: true, promisify: true });
const { getJob, isValidUrl, createJenkinsConfigFile } = require('../../lib/helpers/repo');

class MeetingController extends Controller {

    async apiTest(req, res, next) {
        //console.log("webhook return: ", req.body.repository.full_name);
        //console.log("\n\n\n\n\n\n", req.body);


        if (req.body.hook) {
            console.log("Setting up job on jenkins");
            try {
                const jenkinsConfigXML = await createJenkinsConfigFile({ scmUrl: "https://github.com/" + req.body.repository.full_name });
                await jenkins.job.create(req.body.repository.name, jenkinsConfigXML);
            }
            catch (e) {
                console.log(e);
            }
        }
        else if (req.body.action === "published" && req.body.release.target_commitish === "master") {
            console.log("Starting job");
            try {

                // Start the build
                await jenkins.job.build(req.body.repository.name);
                console.log("starting build");
            }
            catch (e) {
                console.log(e);
            }

        }
        else if (req.body.url) {
            console.log("logging else");
            const jobObj = getJob(req.body.url);
            //console.log(obj.name + obj.number)
            jenkinsapi.test_result(jobObj.name, jobObj.number, function(err, data) {
                if (err) { console.log("getJobDataError"); }
                console.log(data);
            });
        }

    }
}

module.exports = new MeetingController(meetingFacade);
