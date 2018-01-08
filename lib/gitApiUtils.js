const requestP = require('request-promise');

// |-------------------------------------------------------------------------------|
// | PRIVATE / PRIVATE / PRIVATE / PRIVATE / PRIVATE / PRIVATE / PRIVATE / PRIVATE |
// |-------------------------------------------------------------------------------|

function getComments(rawIssues, accessToken, userAgent) {
  return new Promise((resolve, reject) => {
    let i;
    const promises = [];
    let options;
    for (i = 0; i < rawIssues.length; i += 1) {
      options = {
        url: rawIssues[i].comments_url,
        qs: { access_token: accessToken },
        headers: { 'User-Agent': userAgent },
        json: true
      };
      promises.push(requestP(options));
    }

    Promise.all(promises)
            .then(comments => resolve(comments))
            .catch(error => reject(error));
  });

}

function filterComments(rawComments) {
  let i;
  // let j;
  let comments;
  const commentsArr = [];

    // Filter the comments
  for (i = 0; i < rawComments.length; i += 1) {
    comments = rawComments[i].map(comment => ({
      id: comment.id,
      userID: comment.user.id,
      avatarURL: comment.user.avatar_url,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      body: comment.body
    }));
    commentsArr.push(comments);
  }

  return commentsArr;
}

function filterIssues(rawIssues) {
  return rawIssues.map(issue => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    body: issue.body,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    user: issue.user.login,
    avatarURL: issue.user.avatar_ur
  }));
}

function mergeIssuesAndComments(issues, comments) {
  if (issues.length !== comments.length) {
    throw new Error('Different lengths on incoming arrays');
  } else {
    let i;
    for (i = 0; i < issues.length; i += 1) {
      issues[i].comments = comments[i];
    }
  }

  return issues;
}

// TODO
// Find a way to get all comments for all issues in one swoop...
/* function getAllRepoIssueComments(issue) {

} */

// |--------------------------------------------------------------------------------|
// | PUBLIC / PUBLIC / PUBLIC / PUBLIC / PUBLIC / PUBLIC / PUBLIC / PUBLIC / PUBLIC |
// |--------------------------------------------------------------------------------|

function getFilteredRepos(subscriptionURL, accessToken, userAgent) {
  return new Promise((resolve, reject) => {

    const options = {
      url: subscriptionURL,
      qs: {
        access_token: accessToken
      },
      headers: {
        'User-Agent': userAgent
      },
      json: true
    };

    requestP(options)
      .then((rawRepos) => {
        // Filter out the repos where the user is admin
        const filteredRepos = rawRepos.filter(repo => repo.permissions.admin === true);

        // Sorting the arraylist last updated on top
        filteredRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // mapping to not send out more than needed.
        const repos = filteredRepos.map(repo => ({
          fullName: repo.full_name
        }));

        resolve(repos);
      }).catch(err => reject(err));
  });
}

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

function getFilteredIssues(fullName, accessToken, userAgent) {
  let rawIssues;

  return new Promise((resolve, reject) => {
    // Setting options for getting the issues
    const options = {
      url: `https://api.github.com/repos/${fullName}/issues`,
      qs: { access_token: accessToken },
      headers: { 'User-Agent': userAgent },
      json: true
    };

    requestP(options)
      .then((issues) => {
        rawIssues = issues;
          // Get all comments for the issues from request above
        return getComments(rawIssues, accessToken, userAgent);
      })
      .then((rawComments) => {
          // filtering issues & comments to not send out more than needed.
        const comments = filterComments(rawComments);
        const issues = filterIssues(rawIssues);

          // Merging them into on into on array
        const issuesWithComments = mergeIssuesAndComments(issues, comments);
        resolve(issuesWithComments);
      }).catch(err => reject(err));
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

    requestP(options)
      .then((response) => {
        resolve(response);
      }).catch((err) => {
        reject(err);
      });
  });
}


function filterGitPostBody(rawBody) {

  const response = [rawBody].map(issue => ({
    action: issue.action,
    id: issue.issue.id,
    number: issue.issue.number,
    title: issue.issue.title,
    body: issue.issue.body,
    createdAt: issue.issue.created_at,
    updatedAt: issue.issue.updated_at,
    user: issue.issue.user.login,
    avatarURL: issue.issue.user.avatar_url
  }));
  return response[0];
}

// function closeIssue() {}

module.exports = {
  getFilteredRepos,
  isAlreadyHooked,
  getFilteredIssues,
  setGitHook,
  filterGitPostBody
};
