const xml2js = require('xml2js');
const validUrl = require('valid-url');
const fs = require('fs');
const axios = require('axios');

const stripTrailingSlash = str => (
  str.endsWith('/') ?
      str.slice(0, -1) :
      str
);

function XMLStringToObject(string) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(string, (err, result) => {
      if (err) { return reject(err); }
      return resolve(result);
    });
  });
}

function getRepoName(url) {
  return url.split('/').pop();
}

function getOrgAndRepo(url) {
  const parts = url.split('/');
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

function getJob(url) {
  url = stripTrailingSlash(url);
  const split = url.split('_');
  const newurl = split[1].split('/');
  const splitRepo = newurl[newurl.length - 2].split('-');
  const obj = {};
  obj.name = newurl[newurl.length - 2];
  obj.org = split[0].split('/').pop();
  obj.number = newurl[newurl.length - 1];
  obj.exam = `${splitRepo[splitRepo.length - 2]}-${splitRepo[splitRepo.length - 1]}`;
  obj.user = obj.name.split('-')[0];
  return obj;
}

function isValidUrl(repoUrl, scm, organization) {
  // add testing if the scm and org is correct with channel

  if (validUrl.isWebUri(repoUrl)) {
    
    return true;
  }

  return false;
}

function createJenkinsConfigFile(options, jenkinsConfigXMLpath) {
  return new Promise((resolve, reject) => {
    const file = fs.readFileSync('./lib/jenkinsconfig/config.xml', { encoding: 'utf-8' });
    XMLStringToObject(file)
      .then((doc) => {
        doc.project.properties[0]['com.coravy.hudson.plugins.github.GithubProjectProperty'][0].projectUrl[0] = options.scmUrl;
        doc.project.scm[0].userRemoteConfigs[0]['hudson.plugins.git.UserRemoteConfig'][0].url[0] = options.scmUrl;

        const builder = new xml2js.Builder();
        const updatedJenkinsConfigXML = builder.buildObject(doc);
        return resolve(updatedJenkinsConfigXML);
      })
      .catch((e) => { console.log(e); });
  });
}

const getTestCases = (data) => {
  let fails = '';
  for (let i = 0; i < data.suites.length; i += 1) {
    for (let j = 0; j < data.suites[i].cases.length; j += 1) {
      if (data.suites[i].cases[j].status === 'FAILED') {
        fails += `:o: ${data.suites[i].cases[j].name} \n`;
      }
    }
  }
  return fails;
};

const getSlackUserId = async(username) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://slack.com/api/users.list',
      headers: {
        Authorization: `Bearer ${process.env.SLACK_API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
    });
    let memberId;
    for (let i = 0; i < response.data.members.length; i += 1) {
      // TODO
      // In production it should be reponse.data.members[i].name === username
      // if (response.data.members[i].name === username) {
      if (response.data.members[i].profile.display_name.toLowerCase() === username) {
        memberId = response.data.members[i].id;
        break;
      }
    }
    return memberId;
  } catch (e) {
    console.log(e.message);
  }
};

const postMessageToSlackUser = async(userid, channelid, message) => {
  console.log('channelid', channelid);
  console.log('userid', userid);
  try {
    // const response =
    await axios({
      method: 'post',
      url: 'https://slack.com/api/chat.postEphemeral',
      headers: {
        Authorization: `Bearer ${process.env.SLACK_API_TOKEN}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      data: { user: userid, text: message, channel: channelid, as_user: false }
    });
    // console.log(response);
  } catch (e) { console.log(e.message); }
};

module.exports = {
  isValidUrl,
  getRepoName,
  createJenkinsConfigFile,
  getJob,
  getOrgAndRepo,
  getSlackUserId,
  getTestCases,
  postMessageToSlackUser
};
