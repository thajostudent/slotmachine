/* global expect, jest, afterAll */

const app = require('../../index');
const request = require('supertest');

jest.mock('../../lib/middleware/checkSlackToken');

afterAll(() => app.close());

describe('Test the user path', () => {
  test('It should response the GET method', () =>
    request(app)
      .get('/users')
      .then(response => {
        expect(response.statusCode).toBe(406);
      }));
});

describe('Test the user/fail! path', () => {
  test('It should response the GET method', () =>
    request(app)
      .get('/users/fail')
      .then(response => {
        expect(response.statusCode).toBe(404);
      }));
});
