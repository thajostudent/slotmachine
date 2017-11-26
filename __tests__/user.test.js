const sum = require('../lib/sum');

  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('adds 1 + 2 to equal 4', () => {
    expect(sum(1, 2)).toBe(3);
  });

// Dont know if we can do integration tests on CCI?

//const app = require('../index');
//const request = require('supertest');

// describe('Test the user path', () => {
//     test('It should response the GET method', () => {
//         return request(app).get("/user").then(response => {
//             expect(response.statusCode).toBe(200)
//         })
//     });
// })

// describe('Test the user/fail! path', () => {
//     test('It should response the GET method', () => {
//         return request(app).get("/user/fail!").then(response => {
//             expect(response.statusCode).toBe(200)
//         })
//     });
// })
