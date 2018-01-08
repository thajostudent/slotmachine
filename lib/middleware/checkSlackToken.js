const checkSlackToken = (req, res, next) => {
  if (req.body.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    let payload = {};
    try {
      payload = JSON.parse(req.body.payload);
    } catch (e) {
      return res.send('Verification token missing or incorrect.');
    }
    if (payload.token !== process.env.SLACK_VERIFICATION_TOKEN) {
      return res.send('Verification token missing or incorrect.');
    }
  }

  next();
};

module.exports = checkSlackToken;
