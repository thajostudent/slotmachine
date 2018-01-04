const app = require('../index');
const request = require('supertest');

describe('Test the user path', () => {
  test('It should response the GET method', () => {
    return request(app).get('/users').then(response => {
      expect(response.statusCode).toBe(200);
    });
  });
});

// describe('Test the user/fail! path', () => {
//     test('It should response the GET method', () => {
//         return request(app).get("/user/fail!").then(response => {
//             expect(response.statusCode).toBe(200)
//         })
//     });
// })
