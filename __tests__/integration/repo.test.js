const app = require('../../index');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const request = require('supertest');

const mock = new MockAdapter(axios);

jest.mock('../../lib/middleware/checkSlackToken');

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  mock.reset();
});

afterAll(() => (
  app.close()
));

describe('addRepo', () => {
  it('should fail on no URL provided', () => {
    const data = { text: '' };

    return request(app)
      .post('/repos')
      .send(data)
      .then((response) => {
        expect(response.body.text)
          .toEqual(expect.stringContaining('Please add a repo url formated in the following way:'));
      });
  });
  it('should fail on invalid URL provided', () => {
    const data = { text: 'htps://www.google.com' };

    return request(app)
      .post('/repos')
      .send(data)
      .then((response) => {
        expect(response.body.text)
          .toEqual(expect.stringContaining('Please add a repo url formated in the following way:'));
      });
  });
  it('should succeed on correct URL', () => {
    const repoUrl = 'https://github.com/0dv000/xx00xx-exam-1';

    const data = { text: repoUrl };

    mock.onPost('https://api.github.com/repos/0dv000/xx00xx-exam-1/hooks').reply(200);

    return request(app)
      .post('/repos')
      .send(data)
      .then((response) => {
        expect(response.body.text)
          .toBe(`${repoUrl} succesfully added`);
      });
  });
  it('should fail on already existing repo', () => {
    const repoUrl = 'https://github.com/0dv000/xx00xx-exam-1';
    const data = { text: repoUrl };

    mock.onPost('https://api.github.com/repos/0dv000/xx00xx-exam-1/hooks')
      .reply(422,
      { message: 'Validation Failed',
        errors: [
          { resource: 'Hook',
            code: 'custom',
            message: 'Hook already exists on this repository' }
        ],
        documentation_url: 'https://developer.github.com/v3/repos/hooks/#create-a-hook'
      });

    return request(app)
      .post('/repos')
      .send(data)
      .then((response) => {
        expect(response.body.text)
          .toBe(`${repoUrl} has already been added`);
      });
  });
});
