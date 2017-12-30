const moment = require('moment');

const Controller = require('../../lib/controller');
const examFacade = require('./facade');
const meetingFacade = require('../meeting/facade');
const {
  createExamToObject,
  getSemester
} = require('../../lib/tools');


class ExamController extends Controller {
  bookExam(req, res, next) {
    console.log(req.body.payload);
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
            callback_id: "bookExam",
            actions: [
                {
                    "name": "book",
                    "text": "Book",
                    "type": "button",
                    "style": "primary",
                    "value": "test",
                    "confirm": {
                        "title": "Are you sure?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
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

  registerExam(req, res, next) {
    // /createExam Exam-1 31/12 noOfMeetings Length
    // /createexam Exam1 25/11 noOfMeetings Length
    // /createexam Exam1 25/11 8 1
    // one day exam, max 8 1 hour meetings

    const bodyObj = createExamToObject(req.body.text);

    // Create the exam
    this.facade.create({
      course: req.body.channel_name + bodyObj.semester,
      name: bodyObj.name,
      attempt: 1
    }).then((doc) => {
      const meetingPromises = [];

      // Create a meeting for each meeting, time needs fixing...
      for (let i = 0; i < bodyObj.meetings; i += 1) {
        meetingPromises.push(meetingFacade.create({
          startTime: bodyObj.date,
          endTime: bodyObj.date
        }));
      }
      Promise.all(meetingPromises).then((docs) => {
        // Add meetings to exam and save
        doc.meetings = docs;
        // doc.meetings.push(docs[0]._id)
        doc.save();
        // Respond to teacher
        res.send({
          text: `Exam - ${bodyObj.name} created with ${bodyObj.meetings} meetings`
        });
      });
    });
  }
  
  create(req, res, next){
    console.log(req.body.text);
  }
}

module.exports = new ExamController(examFacade);
