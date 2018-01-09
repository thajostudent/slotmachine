/* global expect, afterAll */

const app = require('../../index');
const axios = require('axios');
const mongoose = require('mongoose');
const MockAdapter = require('axios-mock-adapter');
const mockingoose = require('mockingoose').default;
const request = require('supertest');

const mock = new MockAdapter(axios);

jest.mock('../../lib/middleware/checkSlackToken');

afterEach(() => {
  mock.reset();
});

afterAll(() => (
  app.close()
));

describe('Create exam', () => {
  it('should fail if user is not admin', () => {
    const data = { user: { is_admin: false } };

    mock.onPost('https://slack.com/api/users.info').reply(200, data);

    return request(app)
      .post('/exams')
      .then((response) => {
        expect(response.text).toEqual('Not authorized');
      });
  });
});

describe('Book exam', () => {
  it('should notify if there are no exams available', () => {
    const exams = [];

    mockingoose.Exam.toReturn(exams);

    return request(app)
      .post('/exams/book')
      .then((response) => {
        expect(response.body.text).toEqual('Sorry, no exams found for this course.');
      });
  });

  it('should return one attachment per meeting', () => {
    const exam = {
      name: 'TestExam',
      meetings: [
        { _id: mongoose.Types.ObjectId() },
        { _id: mongoose.Types.ObjectId() },
        { _id: mongoose.Types.ObjectId() }
      ]
    };

    mockingoose.Exam.toReturn(exam, 'findOne');

    return request(app)
      .post('/exams/book')
      .then((response) => {
        expect(response.body.text).toEqual('Meetings for exam TestExam:');
        expect(response.body.attachments.length).toEqual(3);
      });
  });
});

describe('List exams', () => {
  it('should fail if user is not admin', () => {
    const data = { user: { is_admin: false } };

    mock.onPost('https://slack.com/api/users.info').reply(200, data);

    return request(app)
      .post('/exams/list')
      .then((response) => {
        expect(response.text).toEqual('Not authorized');
      });
  });

  it('should notify when no exams are found', () => {
    const exams = [];

    const data = { user: { is_admin: true } };

    mock.onPost('https://slack.com/api/users.info').reply(200, data);

    mockingoose.Exam.toReturn(exams, 'find');

    return request(app)
      .post('/exams/list')
      .then((response) => {
        expect(response.body.text).toEqual('Sorry, no exams found.');
      });
  });

  it('should return the correct number of exams', () => {
    const exams = [{}, {}];
    const data = { user: { is_admin: true } };

    mock.onPost('https://slack.com/api/users.info').reply(200, data);

    mockingoose.Exam.toReturn(exams, 'find');

    return request(app)
      .post('/exams/list')
      .then((response) => {
        expect(response.body.text).toEqual('All exams:');
        expect(response.body.attachments.length).toEqual(2);
      });
  });
});

describe('Delete exam', () => {
  it('should reply with name of deleted exam', () => {
    const requestBody = {
      actions: [
        {
          name: 'deleteExam',
          value: '2dv611'
        }
      ],
      callback_id: 'listExams'
    };

    return request(app)
      .post('/interactivecomp')
      .send({ payload: JSON.stringify(requestBody) })
      .then((response) => {
        expect(response.text).toEqual(`Exam for ${requestBody.actions[0].value} deleted.`);
      });
  });
});
