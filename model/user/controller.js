const Controller = require('../../lib/controller');
const userFacade = require('./facade');

class UserController extends Controller {
  
  create(req, res, next) {
    
    //console.log(req.body);
    const users = req.body.text.split(" ")
    const channel = req.body.channel_name.split("-")[0]
    console.log(users);
    console.log(channel);
    
    const promises = users.map((user)=>{
      userFacade.create({username:channel + "/" + user})
    })
    
    Promise.all(promises).then(() =>{
      res.send(req.body).status(200);
    })
  } 
}

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
            jenkinsapi.test_result(jobObj.name, jobObj.number, function(err, data) {
                if (err) { console.log("getJobDataError"); }
                console.log(data);
            });
        }
    }

module.exports = new UserController(userFacade);
