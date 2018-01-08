/* global expect */

const app = require('../../index');
const request = require('supertest');

jest.mock('../../lib/middleware/checkSlackToken');

afterAll(() => {
  return app.close();
});

describe('Test the user path', () => {
  test('It should response the GET method', () => {
    return request(app).get('/users').then((response) => {
      expect(response.statusCode).toBe(404);
    });
  });
});

describe('Test the user/fail! path', () => {
  test('It should response the GET method', () => {
    return request(app).get('/users/fail').then((response) => {
      expect(response.statusCode).toBe(404);
    });
  });
});
