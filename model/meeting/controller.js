const Controller = require('../../lib/controller');
const meetingFacade = require('./facade');
const userFacade = require('../user/facade');
const courseFacade = require('../course/facade');
var Jenkinsapi = require('jenkins-api');
var jenkinsapi = Jenkinsapi.init(`http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.62:8080`);
const jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@194.47.174.62:8080`, crumbIssuer: true, promisify: true });
const { getJob, isValidUrl, createJenkinsConfigFile } = require('../../lib/helpers/repo');
const axios = require('axios')

class MeetingController extends Controller {

    async apiTest(req, res, next) {
        // Setting up jenkins job on webhook creation
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
        // Starting buildjob on webhook release event
        else if (req.body.action === "published" && req.body.release.target_commitish === "master") {
            console.log("Starting buildjob");
            try {
                await jenkins.job.build(req.body.repository.name);
            }
            catch (e) {
                console.log(e);
            }

        }
        // 
        else if (req.body.url) {
           const jobObj = getJob(req.body.url);
             const jenkinsData = await jenkinsapi.test_result(jobObj.name, jobObj.number, async function(err, data) {
              if(err){console.log(err)} 
              if(data.failCount === 0){
                
                
                  const user = await userFacade.findOne({username:jobObj.name.split("-")[0]});
                  const course = await courseFacade.findOne({title:'0dv000'})                  
                  course.users.push(user);
                  await course.save();
                  // Send something the user
                      try {
                        const response = await axios({
                        method: 'post',
                        url: 'https://slack.com/api/users.list',
                        headers: {
                        Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                        }});
                        
                        console.log(response);
                      } catch(e){
                        console.log(e);
                      }
                  
                }
            });
        }
    }
}

module.exports = new MeetingController(meetingFacade);
