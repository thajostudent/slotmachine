const Controller = require('../../lib/controller');
const repoFacade = require('./facade');
const fs = require('fs');
const axios = require('axios')
var jenkins = require('jenkins')({ baseUrl: 'http://fredriko83:bananskal@194.47.174.55:8080', crumbIssuer: false });

class RepoController extends Controller {
  addRepo(req, res, next) {
    console.log(req.body.text);
    
    const repo = 'https://github.com/0dv000/folep02-exam-1'

    const file = fs.readFileSync('./lib/test/config.xml', {encoding: 'utf-8'});
    
    jenkins.job.create('example', file, function(err) {
      if (err) throw err;
    });
    
  }
}

module.exports = new RepoController(repoFacade);
