const requestP = require('request-promise');
const axios = require('axios');


function isAlreadyHooked(repoFullName, accessToken, userAgent, returnAddress) {
  return new Promise((resolve, reject) => {
    let alreadyHooked;
    const options = {
      url: `https://api.github.com/repos/${repoFullName}/hooks`,
      qs: {
        access_token: accessToken
      },
      headers: {
        'User-Agent': userAgent
      },
      json: true
    };

    requestP(options)
      .then((hooks) => {

        let i;
        alreadyHooked = false;
        for (i = 0; i < hooks.length; i += 1) {
          if (hooks[i].config.url === returnAddress && hooks[i].active) {
            alreadyHooked = true;
          }
        }

        resolve(alreadyHooked);
      })
      .catch(err => reject(err));
  });
}



function setGitHook(fullName, accessToken, userAgent, returnAddress, events) {
  return new Promise((resolve, reject) => {
        // Setting options for webhook
    const gitHubWebHookOption = {
      name: 'web',
      active: true,
      events,
      config: {
        url: returnAddress,
        content_type: 'json'
      }
    };

    const axiosOptions = {
      method: 'post',
      url: `https://api.github.com/repos/${fullName}/hooks`,
      params: { access_token: accessToken },
      headers: { 'User-Agent': 'fredriko83' },
      data: gitHubWebHookOption
    };

        // Setting options for the post sending the gitHubWebHookOption
    const options = {
      method: 'POST',
      uri: `https://api.github.com/repos/${fullName}/hooks`,
      // uri: "https://api.github.com/repos/0dv000/folep02-exam-1/" + fullName + "hooks",
      // uri: "https://api.github.com/repos/0dv000/folep02-exam-1/hooks",
      qs: { access_token: accessToken },
      headers: { 'User-Agent': 'fredriko83' },
      body: gitHubWebHookOption,
      json: true
    };

    axios(axiosOptions)
      .then((response) => {
        resolve(response);
      }).catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  isAlreadyHooked,
  setGitHook,
};
