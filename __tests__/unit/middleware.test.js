const checkSlackToken = require('../../lib/middleware/checkSlackToken');

// TODO: better way?
process.env.SLACK_VERIFICATION_TOKEN = '12345';

const send = jest.fn();
const next = jest.fn();
const res = { send };

afterEach(() => {
  jest.clearAllMocks();
});

describe('checkSlackToken', () => {
  it('denies an incorrect token', () => {
    const req = {
      body: {
        token: '123456'
      }
    };

    checkSlackToken(req, res, next);

    expect(send).toHaveBeenCalledWith('Verification token missing or incorrect.');
    expect(next).not.toHaveBeenCalled();
  });
  it('denies an incorrect token in payload', () => {
    const req = {
      body: {
        payload: JSON.stringify({
          token: '123456'
        })
      }
    };

    checkSlackToken(req, res, next);

    expect(send).toHaveBeenCalledWith('Verification token missing or incorrect.');
    expect(next).not.toHaveBeenCalled();
  });
  it('accepts a correct token', () => {
    const req = {
      body: {
        token: '12345'
      }
    };

    checkSlackToken(req, res, next);

    expect(send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
  it('accepts a correct token in payload', () => {
    const req = {
      body: {
        payload: JSON.stringify({
          token: '12345'
        })
      }
    };

    checkSlackToken(req, res, next);

    expect(send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
