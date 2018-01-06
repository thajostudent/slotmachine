const moment = require('moment');
const axios = require('axios');

const Controller = require('../../lib/controller');
const examFacade = require('./facade');
const meetingFacade = require('../meeting/facade');
const {
  createExamToObject,
  getSemester
} = require('../../lib/tools');


class ExamController extends Controller {
  bookExam(req, res, next) {
    return this.facade.findOne({
      course: req.body.channel_name + getSemester()
    }).then((doc) => {
      if (!doc) {
        return res.send({
          text: 'Sorry, no exams found for this course.'
        });
      }

      return res.send({
        text: `Meetings for exam ${doc.name}:`,
        attachments: doc.meetings.map((meeting, index) => (
          {
            title: `Meeting ${index + 1}:`,
            title_link: 'https://www.google.com',
            text: `${moment(meeting.startTime).format('HH:mm')} - ${moment(meeting.endTime).format('HH:mm')}`,
            callback_id: 'bookExam',
            actions: [
              {
                name: 'bookExam',
                text: 'Book',
                type: 'button',
                style: 'primary',
                value: `${meeting._id}:${doc._id}`,
                confirm: {
                  title: 'Are you sure?',
                  ok_text: 'Yes',
                  dismiss_text: 'No'
                }
              }
            ]
          }
        ))
      });
    })
    .catch((err) => {
      console.error(err);
      res.send({ text: 'Sorry, something went wrong.' });
    });
  }

  async createExam(req, res, next) {
    const trigger = req.body.trigger_id;

    try {
      const response = await axios({
        method: 'post',
        url: 'https://slack.com/api/users.info',
        headers: {
          Authorization: `Bearer ${process.env.SLACK_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: `user=${req.body.user_id}`
      });

      if (!response.data.user.is_admin) {
        return res.send('Not authorized');
      }
    } catch (e) {
      console.log(e);
      return res.send('Sorry, something went wrong.');
    }

    const data = {
      callback_id: 'createExam',
      title: 'Create exam',
      elements: [
        {
          type: 'text',
          label: 'Exam name',
          name: 'examName',
          placeholder: 'Exam name'
        },
        {
          type: 'text',
          label: 'Exam date',
          name: 'examDate',
          placeholder: 'Please enter date in the format DD/MM'
        },
        {
          type: 'text',
          label: 'No. of meetings/length',
          name: 'meetings',
          placeholder: 'No. of meetings/length in hours separated by a slash, e.g. 8/1'
        },
        {
          type: 'text',
          label: 'First meeting',
          name: 'firstMeeting',
          placeholder: 'First meeting time, e.g. 8.00'
        },
        {
          type: 'text',
          label: 'Lunch break',
          name: 'lunchBreak',
          placeholder: 'Two times separated by a dash, e.g. 12.00-13.00',
          optional: true
        }
      ]
    };

    axios({
      url: `https://www.slack.com/api/dialog.open?token=${process.env.SLACK_API_TOKEN}&trigger_id=${trigger}`,
      data: `dialog=${encodeURIComponent(JSON.stringify(data))}`,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(resp => {
      console.log(resp.data);
      res.send();
    })
    .catch(err => res.send('Sorry, something went wrong.'));
  }

  listExams(req, res, next) {
    return this.facade.find().then((exams) => {
      if (!exams) {
        return res.send({
          text: 'Sorry, no exams found.'
        });
      }

      return res.send({
        text: 'All exams:',
        attachments: exams.map((exam, index) => (
          {
            title: `Exam: ${exam.name}`,
            title_link: 'https://www.google.com',
            text: `Course: ${exam.course}`,
            callback_id: 'listExams',
            actions: [
              {
                name: 'deleteExam',
                text: 'Delete',
                type: 'button',
                style: 'danger',
                value: `${exam.course}`,
                confirm: {
                  title: 'Are you sure?',
                  ok_text: 'Yes',
                  dismiss_text: 'No'
                }
              }
            ]
          }
        ))
      });
    })
    .catch((err) => {
      console.error(err);
      res.send({ text: 'Sorry, something went wrong.' });
    });
  }

  create(req, res, next){
    console.log(req.body.text);
  }
}

module.exports = new ExamController(examFacade);
