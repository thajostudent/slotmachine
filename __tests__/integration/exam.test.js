/* global expect, afterAll */

const app = require('../../index');
const ExamSchema = require('../../model/exam/schema');
const MeetingSchema = require('../../model/meeting/schema');
const axios = require('axios');
const mongoose = require('mongoose');
const MockAdapter = require('axios-mock-adapter');
// const mockingoose = require('mockingoose').default;
const request = require('supertest');

const mock = new MockAdapter(axios);

jest.mock('../../lib/middleware/checkSlackToken');
jest.mock('../../lib/tools');

const Exam = mongoose.model('Exam', ExamSchema);
const Meeting = mongoose.model('Meeting', MeetingSchema);

afterEach(async () => {
  mock.reset();
  await Exam.remove({});
  await Meeting.remove({});
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await app.close();
});

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
  it('should notify if there are no exams available', () => (
    request(app)
      .post('/exams/book')
      .send({
        channel_name: 'general'
      })
      .then((response) => {
        expect(response.body.text).toEqual('Sorry, no exams found for this course.');
      })
  ));

  it('should return one attachment per meeting', async () => {
    const firstMeeting = mongoose.Types.ObjectId();
    const secondMeeting = mongoose.Types.ObjectId();
    const thirdMeeting = mongoose.Types.ObjectId();

    const meetings = [
      {
        _id: firstMeeting,
        startTime: new Date('2018-02-09T09:00:00'),
        endTime: new Date('2018-02-09T10:00:00')
      },
      {
        _id: secondMeeting,
        startTime: new Date('2018-02-09T10:00:00'),
        endTime: new Date('2018-02-09T11:00:00')
      },
      {
        _id: thirdMeeting,
        startTime: new Date('2018-02-09T11:00:00'),
        endTime: new Date('2018-02-09T12:00:00')
      }
    ];

    const exam = {
      name: 'TestExam',
      course: 'generalvt2018',
      meetings: [
        firstMeeting,
        secondMeeting,
        thirdMeeting
      ]
    };

    await Meeting.create(meetings);
    await Exam.create(exam);

    await request(app)
      .post('/exams/book')
      .send({
        channel_name: 'general'
      })
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
    const data = { user: { is_admin: true } };

    mock.onPost('https://slack.com/api/users.info').reply(200, data);

    return request(app)
      .post('/exams/list')
      .then((response) => {
        expect(response.body.text).toEqual('Sorry, no exams found!!!!!!');
      });
  });

  it('should return the correct number of exams', async () => {
    const exams = [
      {
        course: 'generalvt2018'
      },
      {
        course: '1dv000vt2018'
      }
    ];
    const data = { user: { is_admin: true } };

    mock.onPost('https://slack.com/api/users.info').reply(200, data);

    await Exam.create(exams);

    await request(app)
      .post('/exams/list')
      .then((response) => {
        expect(response.body.text).toEqual('All exams:');
        expect(response.body.attachments.length).toEqual(2);
      });
  });
});

describe('Delete exam', () => {
  it('should delete exam and reply with name of deleted exam', async () => {
    const examId = mongoose.Types.ObjectId();

    const exam = {
      _id: examId,
      course: '2dv611'
    };

    const requestBody = {
      actions: [
        {
          name: 'deleteExam',
          value: JSON.stringify({
            courseName: '2dv611',
            examId
          })
        }
      ],
      callback_id: 'listExams',
      user: {
        id: 'what'
      }
    };

    const courseName = JSON.parse(requestBody.actions[0].value).courseName;

    await Exam.create(exam);

    const doc = Exam.findById(examId);

    expect(doc).not.toBeFalsy();

    const data = { user: { is_admin: true } };
    mock.onPost('https://slack.com/api/users.info').reply(200, data);

    const response = await request(app)
      .post('/interactivecomp')
      .send({ payload: JSON.stringify(requestBody) });

    expect(response.text).toEqual(`Exam for ${courseName} deleted.`);

    const removed = await Exam.findById(examId);

    expect(removed).toBeFalsy();
  });
});
